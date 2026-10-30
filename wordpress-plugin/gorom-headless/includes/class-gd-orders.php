<?php
/**
 * অর্ডার, কোট, কুপন ও ট্র্যাকিং লজিক — সব দাম/চার্জ সার্ভারে পুনর্গণিত হয়।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Orders {

	const PHONE_REGEX = '/^01[3-9]\d{8}$/';
	const MAX_LINES   = 30;
	const MAX_QTY     = 20;

	/* ------------------------------------------------------------------ */
	/* Helpers                                                             */
	/* ------------------------------------------------------------------ */

	public static function msg( $bn, $en, $lang ) {
		return 'en' === $lang ? $en : $bn;
	}

	public static function err( $code, $bn, $en, $lang, $status = 400 ) {
		return new WP_Error( 'gd_' . $code, self::msg( $bn, $en, $lang ), array( 'status' => $status ) );
	}

	public static function lang( $raw ) {
		return 'en' === $raw ? 'en' : 'bn';
	}

	/** বাংলা ডিজিট → ইংরেজি, +880/880 বাদ, স্পেস/ড্যাশ বাদ */
	public static function normalize_phone( $raw ) {
		$raw = (string) $raw;
		$map = array(
			'০' => '0', '১' => '1', '২' => '2', '৩' => '3', '৪' => '4',
			'৫' => '5', '৬' => '6', '৭' => '7', '৮' => '8', '৯' => '9',
		);
		$raw = strtr( $raw, $map );
		$d   = preg_replace( '/\D+/', '', $raw );
		if ( 0 === strpos( $d, '880' ) && strlen( $d ) === 13 ) {
			$d = '0' . substr( $d, 3 );
		}
		return $d;
	}

	public static function valid_phone( $phone ) {
		return (bool) preg_match( self::PHONE_REGEX, $phone );
	}

	/**
	 * ক্লায়েন্ট IP। শুধুমাত্র Next.js প্রক্সি সঠিক secret পাঠালেই ফরোয়ার্ড করা IP বিশ্বাস করা হয়।
	 */
	public static function client_ip( $request = null ) {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		if ( $request instanceof WP_REST_Request ) {
			$secret = (string) GD_Settings::get( 'integrations', 'proxy_secret', '' );
			$key    = (string) $request->get_header( 'x_gd_proxy_key' );
			if ( '' !== $secret && '' !== $key && hash_equals( $secret, $key ) ) {
				$fwd = (string) $request->get_header( 'x_gd_client_ip' );
				$fwd = trim( explode( ',', $fwd )[0] );
				if ( filter_var( $fwd, FILTER_VALIDATE_IP ) ) {
					$ip = $fwd;
				}
			}
		}
		return $ip;
	}

	/** ট্রানজিয়েন্ট কাউন্টার। সীমা পেরোলে true। */
	public static function rate_limited( $bucket, $limit, $ttl = HOUR_IN_SECONDS ) {
		$limit = (int) $limit;
		if ( $limit <= 0 ) {
			return false;
		}
		$key   = 'gd_rl_' . md5( $bucket );
		$count = (int) get_transient( $key );
		if ( $count >= $limit ) {
			return true;
		}
		set_transient( $key, $count + 1, $ttl );
		return false;
	}

	/* ------------------------------------------------------------------ */
	/* Lines                                                               */
	/* ------------------------------------------------------------------ */

	/**
	 * @param array  $items [{id, qty, variant?}]
	 * @param string $lang
	 * @return array|WP_Error {lines, subtotal}
	 */
	public static function build_lines( $items, $lang, $check_stock = true ) {
		if ( ! is_array( $items ) || ! $items ) {
			return self::err( 'empty_cart', 'কার্ট খালি', 'Cart is empty', $lang );
		}
		if ( count( $items ) > self::MAX_LINES ) {
			return self::err( 'too_many', 'অনেক বেশি আইটেম', 'Too many items', $lang );
		}
		$merged = array();
		foreach ( $items as $it ) {
			if ( ! is_array( $it ) ) {
				continue;
			}
			$id  = isset( $it['id'] ) ? absint( $it['id'] ) : 0;
			$qty = isset( $it['qty'] ) ? absint( $it['qty'] ) : 0;
			$var = isset( $it['variant'] ) ? sanitize_text_field( (string) $it['variant'] ) : '';
			if ( ! $id || $qty < 1 ) {
				continue;
			}
			$k = $id . '|' . $var;
			if ( isset( $merged[ $k ] ) ) {
				$merged[ $k ]['qty'] += $qty;
			} else {
				$merged[ $k ] = array( 'id' => $id, 'qty' => $qty, 'variant' => $var );
			}
		}
		if ( ! $merged ) {
			return self::err( 'empty_cart', 'কার্ট খালি', 'Cart is empty', $lang );
		}
		$lines    = array();
		$subtotal = 0.0;
		foreach ( $merged as $m ) {
			$product = wc_get_product( $m['id'] );
			if ( ! $product || 'publish' !== $product->get_status() || ! $product->is_purchasable() ) {
				return self::err( 'bad_product', 'একটি পণ্য আর পাওয়া যাচ্ছে না', 'A product is no longer available', $lang );
			}
			if ( $product->is_type( 'variable' ) ) {
				return self::err( 'unsupported', 'ভ্যারিয়েবল পণ্য সমর্থিত নয়', 'Variable products are not supported', $lang );
			}
			$qty = min( $m['qty'], self::MAX_QTY );
			if ( $check_stock && ( ! $product->is_in_stock() || ! $product->has_enough_stock( $qty ) ) ) {
				return self::err(
					'out_of_stock',
					sprintf( '"%s" পর্যাপ্ত স্টকে নেই', $product->get_name() ),
					sprintf( '"%s" is out of stock', $product->get_name() ),
					$lang
				);
			}
			$price = (float) $product->get_price();
			if ( $price < 0 ) {
				$price = 0;
			}
			$regular    = (float) $product->get_regular_price();
			$line_total = round( $price * $qty, 2 );
			$subtotal  += $line_total;
			$lines[]    = array(
				'product'       => $product,
				'id'            => $product->get_id(),
				'name'          => $product->get_name(),
				'qty'           => $qty,
				'variant'       => $m['variant'],
				'price'         => $price,
				'regular_price' => $regular > 0 ? $regular : $price,
				'line_total'    => $line_total,
			);
		}
		return array(
			'lines'    => $lines,
			'subtotal' => round( $subtotal, 2 ),
		);
	}

	/* ------------------------------------------------------------------ */
	/* Shipping                                                            */
	/* ------------------------------------------------------------------ */

	public static function shipping_for( $district, $subtotal ) {
		$d        = GD_Settings::all()['delivery'];
		$inside   = GD_Settings::is_dhaka_zone( $district );
		$custom   = $inside ? (float) $d['inside_charge'] : (float) $d['outside_charge'];
		$charge   = $custom;
		$free_on  = ! empty( $d['free_enabled'] );
		$thresh   = (float) $d['free_threshold'];

		if ( 'woo' === $d['mode'] && class_exists( 'WC_Shipping_Zones' ) ) {
			$package = array(
				'destination' => array( 'country' => 'BD', 'state' => '', 'postcode' => '', 'city' => '' ),
			);
			$zone = WC_Shipping_Zones::get_zone_matching_package( $package );
			if ( $zone ) {
				foreach ( $zone->get_shipping_methods( true ) as $method ) {
					if ( 'flat_rate' === $method->id ) {
						$cost = $method->get_option( 'cost' );
						if ( is_numeric( $cost ) ) {
							$charge = (float) $cost;
						}
						break;
					}
				}
			}
		}

		$free = $free_on && $thresh > 0 && $subtotal >= $thresh;
		return array(
			'charge'    => $free ? 0.0 : $charge,
			'base'      => $charge,
			'free'      => $free,
			'inside'    => $inside,
			'remaining' => ( $free_on && $thresh > 0 && ! $free ) ? max( 0, round( $thresh - $subtotal, 2 ) ) : 0,
		);
	}

	/* ------------------------------------------------------------------ */
	/* Coupon                                                              */
	/* ------------------------------------------------------------------ */

	/**
	 * @return array|WP_Error {code, type, amount, discount, label}
	 */
	public static function check_coupon( $code, $subtotal, $lang ) {
		$code = wc_format_coupon_code( sanitize_text_field( (string) $code ) );
		if ( '' === $code ) {
			return self::err( 'coupon_empty', 'কুপন কোড লিখুন', 'Enter a coupon code', $lang );
		}
		$coupon = new WC_Coupon( $code );
		if ( ! $coupon->get_id() ) {
			return self::err( 'coupon_invalid', 'কুপন কোডটি সঠিক নয়', 'Invalid coupon code', $lang );
		}
		$exp = $coupon->get_date_expires();
		if ( $exp && $exp->getTimestamp() < time() ) {
			return self::err( 'coupon_expired', 'কুপনটির মেয়াদ শেষ', 'This coupon has expired', $lang );
		}
		$limit = $coupon->get_usage_limit();
		if ( $limit > 0 && $coupon->get_usage_count() >= $limit ) {
			return self::err( 'coupon_used', 'কুপনটির ব্যবহারের সীমা শেষ', 'Coupon usage limit reached', $lang );
		}
		$type = $coupon->get_discount_type();
		if ( ! in_array( $type, array( 'percent', 'fixed_cart' ), true ) ) {
			return self::err( 'coupon_type', 'এই কুপনটি এখানে প্রযোজ্য নয়', 'This coupon is not applicable', $lang );
		}
		$min = (float) $coupon->get_minimum_amount();
		$max = (float) $coupon->get_maximum_amount();
		if ( $min > 0 && $subtotal < $min ) {
			return self::err(
				'coupon_min',
				sprintf( 'এই কুপনের জন্য ন্যূনতম ৳%s কেনাকাটা করতে হবে', wc_format_decimal( $min ) ),
				sprintf( 'Minimum spend of %s required', wc_format_decimal( $min ) ),
				$lang
			);
		}
		if ( $max > 0 && $subtotal > $max ) {
			return self::err( 'coupon_max', 'এই কুপন বর্তমান অর্ডারে প্রযোজ্য নয়', 'Coupon not valid for this order total', $lang );
		}
		$amount   = (float) $coupon->get_amount();
		$discount = 'percent' === $type ? round( $subtotal * $amount / 100, 2 ) : min( $amount, $subtotal );
		return array(
			'code'     => $coupon->get_code(),
			'type'     => $type,
			'amount'   => $amount,
			'discount' => max( 0, min( $discount, $subtotal ) ),
		);
	}

	/* ------------------------------------------------------------------ */
	/* Quote                                                               */
	/* ------------------------------------------------------------------ */

	public static function quote( $data ) {
		$lang  = self::lang( isset( $data['lang'] ) ? $data['lang'] : 'bn' );
		$built = self::build_lines( isset( $data['items'] ) ? $data['items'] : array(), $lang, false );
		if ( is_wp_error( $built ) ) {
			return $built;
		}
		$district = isset( $data['district'] ) ? sanitize_text_field( (string) $data['district'] ) : '';
		$ship     = self::shipping_for( $district, $built['subtotal'] );

		$discount = 0.0;
		$coupon   = null;
		$cerror   = null;
		if ( ! empty( $data['coupon'] ) ) {
			$c = self::check_coupon( $data['coupon'], $built['subtotal'], $lang );
			if ( is_wp_error( $c ) ) {
				$cerror = $c->get_error_message();
			} else {
				$coupon   = $c;
				$discount = $c['discount'];
			}
		}
		$lines = array();
		foreach ( $built['lines'] as $l ) {
			$lines[] = array(
				'id'            => $l['id'],
				'name'          => $l['name'],
				'qty'           => $l['qty'],
				'price'         => $l['price'],
				'regular_price' => $l['regular_price'],
				'line_total'    => $l['line_total'],
				'in_stock'      => $l['product']->is_in_stock(),
			);
		}
		return array(
			'lines'          => $lines,
			'subtotal'       => $built['subtotal'],
			'shipping'       => $ship['charge'],
			'shipping_free'  => $ship['free'],
			'free_remaining' => $ship['remaining'],
			'discount'       => $discount,
			'coupon'         => $coupon,
			'coupon_error'   => $cerror,
			'total'          => max( 0, round( $built['subtotal'] - $discount + $ship['charge'], 2 ) ),
			'currency'       => get_woocommerce_currency(),
		);
	}

	/* ------------------------------------------------------------------ */
	/* Create order                                                        */
	/* ------------------------------------------------------------------ */

	public static function create( $data, $request = null ) {
		$lang = self::lang( isset( $data['lang'] ) ? $data['lang'] : 'bn' );
		$set  = GD_Settings::all();
		$co   = $set['checkout'];

		// হানিপট — বট হলে নীরবে ফেক সাকসেস।
		if ( ! empty( $data['website'] ) ) {
			return array(
				'ok'        => true,
				'order_id'  => 0,
				'order_ref' => 'GD-0',
				'honeypot'  => true,
			);
		}
		if ( empty( $co['cod_enabled'] ) ) {
			return self::err( 'cod_off', 'বর্তমানে অর্ডার নেওয়া বন্ধ আছে', 'Orders are currently disabled', $lang, 403 );
		}

		$name     = isset( $data['name'] ) ? sanitize_text_field( (string) $data['name'] ) : '';
		$address  = isset( $data['address'] ) ? sanitize_textarea_field( (string) $data['address'] ) : '';
		$note     = isset( $data['note'] ) ? sanitize_textarea_field( (string) $data['note'] ) : '';
		$email    = isset( $data['email'] ) ? sanitize_email( (string) $data['email'] ) : '';
		$phone    = self::normalize_phone( isset( $data['phone'] ) ? $data['phone'] : '' );
		$district = isset( $data['district'] ) ? sanitize_text_field( (string) $data['district'] ) : '';

		if ( mb_strlen( $name ) < 2 || mb_strlen( $name ) > 100 ) {
			return self::err( 'name', 'সঠিক নাম লিখুন', 'Enter a valid name', $lang );
		}
		if ( ! self::valid_phone( $phone ) ) {
			return self::err( 'phone', 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)', 'Enter a valid mobile number (01XXXXXXXXX)', $lang );
		}
		if ( mb_strlen( $address ) < 6 || mb_strlen( $address ) > 400 ) {
			return self::err( 'address', 'সম্পূর্ণ ঠিকানা লিখুন', 'Enter your full address', $lang );
		}
		$drow = GD_Settings::find_district( $district );
		if ( ! $drow ) {
			return self::err( 'district', 'জেলা নির্বাচন করুন', 'Select a district', $lang );
		}
		if ( ! empty( $data['email'] ) && ! is_email( $email ) ) {
			return self::err( 'email', 'সঠিক ইমেইল দিন', 'Enter a valid email', $lang );
		}

		// রেট লিমিট।
		$ip = self::client_ip( $request );
		if ( self::rate_limited( 'phone:' . $phone, (int) $co['rate_phone'] ) || self::rate_limited( 'ip:' . $ip, (int) $co['rate_ip'] ) ) {
			return self::err( 'rate', 'অনেকগুলো অনুরোধ হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন', 'Too many requests, please try again later', $lang, 429 );
		}

		$built = self::build_lines( isset( $data['items'] ) ? $data['items'] : array(), $lang, true );
		if ( is_wp_error( $built ) ) {
			return $built;
		}
		if ( (float) $co['min_order'] > 0 && $built['subtotal'] < (float) $co['min_order'] ) {
			return self::err(
				'min_order',
				sprintf( 'ন্যূনতম অর্ডার ৳%s', wc_format_decimal( $co['min_order'] ) ),
				sprintf( 'Minimum order is %s', wc_format_decimal( $co['min_order'] ) ),
				$lang
			);
		}

		// ডুপ্লিকেট চেক।
		$sig = array();
		foreach ( $built['lines'] as $l ) {
			$sig[] = $l['id'] . 'x' . $l['qty'] . ':' . $l['variant'];
		}
		sort( $sig );
		$dup_key = 'gd_dup_' . md5( $phone . '|' . implode( ',', $sig ) . '|' . $drow['name_en'] );
		$dup_id  = (int) get_transient( $dup_key );
		if ( $dup_id ) {
			$existing = wc_get_order( $dup_id );
			if ( $existing ) {
				return self::order_response( $existing, true );
			}
		}

		// কুপন।
		$coupon_code = '';
		if ( ! empty( $data['coupon'] ) ) {
			$c = self::check_coupon( $data['coupon'], $built['subtotal'], $lang );
			if ( is_wp_error( $c ) ) {
				return $c;
			}
			$coupon_code = $c['code'];
		}

		$ship = self::shipping_for( $district, $built['subtotal'] );

		$order = wc_create_order(
			array(
				'status'     => 'pending',
				'created_via' => 'gorom-headless',
			)
		);
		if ( is_wp_error( $order ) ) {
			return self::err( 'create', 'অর্ডার তৈরি করা যায়নি', 'Could not create the order', $lang, 500 );
		}

		foreach ( $built['lines'] as $l ) {
			$item_id = $order->add_product( $l['product'], $l['qty'] );
			if ( $item_id && '' !== $l['variant'] ) {
				wc_add_order_item_meta( $item_id, 'Variant', $l['variant'] );
			}
		}

		$parts = explode( ' ', $name, 2 );
		$addr  = array(
			'first_name' => $parts[0],
			'last_name'  => isset( $parts[1] ) ? $parts[1] : '',
			'address_1'  => $address,
			'city'       => $drow['name_en'],
			'state'      => $drow['name_en'],
			'country'    => 'BD',
		);
		$order->set_address( array_merge( $addr, array( 'phone' => $phone, 'email' => $email ) ), 'billing' );
		$order->set_address( $addr, 'shipping' );
		if ( '' !== $note ) {
			$order->set_customer_note( $note );
		}

		if ( '' !== $coupon_code ) {
			$applied = $order->apply_coupon( $coupon_code );
			if ( is_wp_error( $applied ) ) {
				$order->delete( true );
				return self::err( 'coupon', 'কুপনটি প্রয়োগ করা যায়নি', 'Coupon could not be applied', $lang );
			}
		}

		$shipping = new WC_Order_Item_Shipping();
		$shipping->set_method_title( $ship['free'] ? 'Free Delivery' : ( $ship['inside'] ? 'Delivery (Inside Dhaka)' : 'Delivery (Outside Dhaka)' ) );
		$shipping->set_method_id( 'gd_delivery' );
		$shipping->set_total( $ship['charge'] );
		$order->add_item( $shipping );

		$order->set_payment_method( 'cod' );
		$order->set_payment_method_title( 'Cash on Delivery' );
		$order->calculate_totals( false );

		$order->update_meta_data( '_gd_ip', $ip );
		$order->update_meta_data( '_gd_lang', $lang );
		$order->update_meta_data( '_gd_district_zone', $ship['inside'] ? 'inside' : 'outside' );
		$order->save();

		// ইমেইল/স্টক হ্রাস ট্রিগার করতে স্ট্যাটাস আপডেট।
		$status = isset( $co['order_status'] ) ? $co['order_status'] : 'processing';
		if ( ! in_array( $status, array( 'processing', 'on-hold', 'pending' ), true ) ) {
			$status = 'processing';
		}
		$order->update_status( $status, 'Gorom Headless: ওয়েবসাইট থেকে COD অর্ডার।' );

		set_transient( $dup_key, $order->get_id(), max( 1, (int) $co['dup_window'] ) * MINUTE_IN_SECONDS );

		do_action( 'gd_order_created', $order->get_id() );

		return self::order_response( $order, false );
	}

	private static function order_response( $order, $duplicate ) {
		$prefix = (string) GD_Settings::get( 'checkout', 'order_prefix', 'GD-' );
		return array(
			'ok'        => true,
			'duplicate' => (bool) $duplicate,
			'order_id'  => $order->get_id(),
			'order_ref' => $prefix . $order->get_id(),
			'total'     => (float) $order->get_total(),
			'shipping'  => (float) $order->get_shipping_total(),
			'discount'  => (float) $order->get_discount_total(),
			'currency'  => $order->get_currency(),
			'status'    => self::status_key( $order->get_status() ),
		);
	}

	/* ------------------------------------------------------------------ */
	/* Track                                                               */
	/* ------------------------------------------------------------------ */

	public static function status_key( $wc_status ) {
		$map = array(
			'pending'    => 'received',
			'on-hold'    => 'received',
			'processing' => 'confirmed',
			'completed'  => 'delivered',
			'cancelled'  => 'cancelled',
			'failed'     => 'cancelled',
			'refunded'   => 'refunded',
		);
		return isset( $map[ $wc_status ] ) ? $map[ $wc_status ] : 'received';
	}

	public static function track( $order_raw, $phone_raw, $lang, $request = null ) {
		$lang  = self::lang( $lang );
		$ip    = self::client_ip( $request );
		$phone = self::normalize_phone( $phone_raw );
		if ( self::rate_limited( 'track:' . $ip, 30 ) ) {
			return self::err( 'rate', 'অনেকগুলো অনুরোধ হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন', 'Too many requests, please try again later', $lang, 429 );
		}
		$notfound = self::err( 'not_found', 'অর্ডারটি খুঁজে পাওয়া যায়নি। অর্ডার নম্বর ও ফোন নম্বর মিলিয়ে দেখুন।', 'Order not found. Please check the order number and phone.', $lang, 404 );

		$digits = preg_replace( '/\D+/', '', strtr( (string) $order_raw, array( '০' => '0', '১' => '1', '২' => '2', '৩' => '3', '৪' => '4', '৫' => '5', '৬' => '6', '৭' => '7', '৮' => '8', '৯' => '9' ) ) );
		if ( '' === $digits || ! self::valid_phone( $phone ) ) {
			return $notfound;
		}
		$order = wc_get_order( absint( $digits ) );
		if ( ! $order || 'shop_order' !== $order->get_type() ) {
			return $notfound;
		}
		if ( self::normalize_phone( $order->get_billing_phone() ) !== $phone ) {
			return $notfound;
		}

		$items = array();
		foreach ( $order->get_items() as $item ) {
			$items[] = array(
				'name'  => $item->get_name(),
				'qty'   => (int) $item->get_quantity(),
				'total' => (float) $item->get_total(),
			);
		}
		$updates = array();
		if ( function_exists( 'wc_get_order_notes' ) ) {
			$notes = wc_get_order_notes( array( 'order_id' => $order->get_id(), 'type' => 'customer' ) );
			foreach ( (array) $notes as $n ) {
				$updates[] = array(
					'date' => $n->date_created ? $n->date_created->date( 'c' ) : '',
					'text' => wp_strip_all_tags( $n->content ),
				);
			}
		}
		$created = $order->get_date_created();
		$prefix  = (string) GD_Settings::get( 'checkout', 'order_prefix', 'GD-' );
		return array(
			'ok'         => true,
			'order_id'   => $order->get_id(),
			'order_ref'  => $prefix . $order->get_id(),
			'status'     => self::status_key( $order->get_status() ),
			'wc_status'  => $order->get_status(),
			'status_label' => wc_get_order_status_name( $order->get_status() ),
			'created_at' => $created ? $created->date( 'c' ) : '',
			'items'      => $items,
			'subtotal'   => (float) $order->get_subtotal(),
			'shipping'   => (float) $order->get_shipping_total(),
			'discount'   => (float) $order->get_discount_total(),
			'total'      => (float) $order->get_total(),
			'currency'   => $order->get_currency(),
			'district'   => $order->get_billing_city(),
			'updates'    => $updates,
		);
	}
}
