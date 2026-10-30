<?php
/**
 * ডেমো ডেটা ইমপোর্ট: ক্যাটাগরি, পণ্য, সেটিংস, কুপন, মেনু, পলিসি পেজ (ড্রাফ্ট)।
 * অ্যাডমিন বাটন (Gorom Headless → ফ্রন্টএন্ড কানেকশন) ও `wp gorom seed` থেকে চালানো যায়।
 * বারবার চালালে ডুপ্লিকেট হয় না (SKU / slug / code দিয়ে মেলানো হয়)।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Seed {

	/** @var array filename => attachment id */
	private static $att_cache = array();

	public static function init() {
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'gorom seed', array( __CLASS__, 'cli' ) );
		}
	}

	/**
	 * Gorom Deal ডেমো ডেটা ইমপোর্ট করে।
	 *
	 * ## OPTIONS
	 *
	 * [--overwrite-settings]
	 * : বিদ্যমান সেটিংস ট্যাবগুলোও ওভাররাইট করবে।
	 *
	 * ## EXAMPLES
	 *
	 *     wp gorom seed
	 *     wp gorom seed --overwrite-settings
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Assoc args.
	 */
	public static function cli( $args, $assoc_args ) {
		$report = self::run( array( 'overwrite_settings' => ! empty( $assoc_args['overwrite-settings'] ) ) );
		WP_CLI::success( $report );
	}

	private static function read_json( $name ) {
		$file = GD_DIR . 'data/' . $name;
		if ( ! file_exists( $file ) ) {
			return array();
		}
		$data = json_decode( (string) file_get_contents( $file ), true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * @param array $opts overwrite_settings(bool)
	 * @return string রিপোর্ট
	 */
	public static function run( $opts = array() ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return 'WooCommerce চালু নেই — আগে WooCommerce অ্যাক্টিভেট করুন।';
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$overwrite = ! empty( $opts['overwrite_settings'] );
		$count     = array(
			'cats'     => 0,
			'products' => 0,
			'images'   => 0,
			'coupons'  => 0,
			'pages'    => 0,
			'menus'    => 0,
		);

		$products_data = self::read_json( 'seed-products.json' );
		$settings_data = self::read_json( 'seed-settings.json' );

		// ১. ক্যাটাগরি।
		$cat_ids = array();
		foreach ( (array) ( isset( $products_data['categories'] ) ? $products_data['categories'] : array() ) as $c ) {
			$term = get_term_by( 'slug', $c['slug'], 'product_cat' );
			if ( ! $term ) {
				$res = wp_insert_term( $c['name_bn'], 'product_cat', array( 'slug' => $c['slug'] ) );
				if ( is_wp_error( $res ) ) {
					continue;
				}
				$term_id = (int) $res['term_id'];
				$count['cats']++;
			} else {
				$term_id = (int) $term->term_id;
			}
			$cat_ids[ $c['slug'] ] = $term_id;
			update_term_meta( $term_id, 'gd_name_en', sanitize_text_field( $c['name_en'] ) );
			update_term_meta( $term_id, 'gd_icon', sanitize_text_field( $c['icon'] ) );
			update_term_meta( $term_id, 'gd_order', (int) $c['order'] );
		}

		// ২. পণ্য।
		foreach ( (array) ( isset( $products_data['products'] ) ? $products_data['products'] : array() ) as $p ) {
			if ( self::upsert_product( $p, $cat_ids, $count ) ) {
				$count['products']++;
			}
		}

		// ৩. সেটিংস।
		self::seed_settings( $settings_data, $overwrite, $count );

		// ৪. কুপন।
		foreach ( (array) ( isset( $settings_data['_coupons'] ) ? $settings_data['_coupons'] : array() ) as $c ) {
			$code = wc_format_coupon_code( $c['code'] );
			if ( wc_get_coupon_id_by_code( $code ) ) {
				continue;
			}
			$coupon = new WC_Coupon();
			$coupon->set_code( $code );
			$coupon->set_discount_type( 'percent' === $c['type'] ? 'percent' : 'fixed_cart' );
			$coupon->set_amount( (float) $c['amount'] );
			$coupon->save();
			$count['coupons']++;
		}

		// ৫. পলিসি পেজ (ড্রাফ্ট; আইনি টেক্সট আপনাকে লিখতে হবে)।
		foreach ( (array) ( isset( $settings_data['_pages'] ) ? $settings_data['_pages'] : array() ) as $pg ) {
			if ( get_page_by_path( $pg['slug'], OBJECT, 'page' ) ) {
				continue;
			}
			$id = wp_insert_post(
				array(
					'post_type'    => 'page',
					'post_status'  => 'draft',
					'post_title'   => sanitize_text_field( $pg['title_bn'] ),
					'post_name'    => sanitize_title( $pg['slug'] ),
					'post_content' => '<!-- এখানে আপনার পলিসির লেখা দিন, তারপর পেজটি Publish করুন। -->',
				)
			);
			if ( $id && ! is_wp_error( $id ) ) {
				update_post_meta( $id, 'gd_title_en', sanitize_text_field( $pg['title_en'] ) );
				$count['pages']++;
			}
		}

		// ৬. মেনু।
		self::seed_menus( isset( $settings_data['_menus'] ) ? $settings_data['_menus'] : array(), $cat_ids, $overwrite, $count );

		GD_Settings::flush_cache();

		return sprintf(
			'Seed সম্পন্ন: নতুন ক্যাটাগরি %d, পণ্য প্রক্রিয়াজাত %d, নতুন ছবি %d, কুপন %d, ড্রাফ্ট পেজ %d, মেনু %d। (পলিসি পেজ ড্রাফ্ট — কনটেন্ট দিয়ে Publish করুন।)',
			$count['cats'],
			$count['products'],
			$count['images'],
			$count['coupons'],
			$count['pages'],
			$count['menus']
		);
	}

	/* ------------------------------------------------------------------ */

	private static function attachment_for( $filename, &$count ) {
		$filename = basename( (string) $filename );
		if ( '' === $filename ) {
			return 0;
		}
		if ( isset( self::$att_cache[ $filename ] ) ) {
			return self::$att_cache[ $filename ];
		}
		$existing = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_key'       => '_gd_seed_file', // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value'     => $filename, // phpcs:ignore WordPress.DB.SlowDBQuery
			)
		);
		if ( $existing ) {
			self::$att_cache[ $filename ] = (int) $existing[0];
			return (int) $existing[0];
		}
		$src = GD_DIR . 'data/images/' . $filename;
		if ( ! file_exists( $src ) ) {
			return 0;
		}
		$tmp = wp_tempnam( $filename );
		if ( ! $tmp || ! copy( $src, $tmp ) ) {
			return 0;
		}
		$file = array(
			'name'     => $filename,
			'tmp_name' => $tmp,
		);
		$id = media_handle_sideload( $file, 0 );
		if ( is_wp_error( $id ) ) {
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors, WordPress.WP.AlternativeFunctions
			return 0;
		}
		update_post_meta( $id, '_gd_seed_file', $filename );
		$count['images']++;
		self::$att_cache[ $filename ] = (int) $id;
		return (int) $id;
	}

	private static function upsert_product( $p, $cat_ids, &$count ) {
		$sku = sanitize_text_field( $p['sku'] );
		$id  = wc_get_product_id_by_sku( $sku );
		$product = $id ? wc_get_product( $id ) : new WC_Product_Simple();
		if ( ! $product ) {
			return false;
		}
		$product->set_name( sanitize_text_field( $p['name_bn'] ) );
		if ( ! $id ) {
			$product->set_slug( sanitize_title( $p['key'] ) );
			$product->set_sku( $sku );
		}
		$product->set_status( 'publish' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_description( wp_kses_post( $p['description_bn'] ) );

		$regular = (float) $p['regular_price'];
		$price   = (float) $p['price'];
		if ( $regular > $price ) {
			$product->set_regular_price( (string) $regular );
			$product->set_sale_price( (string) $price );
		} else {
			$product->set_regular_price( (string) $price );
			$product->set_sale_price( '' );
		}
		$product->set_manage_stock( true );
		$product->set_stock_quantity( isset( $p['stock'] ) ? (int) $p['stock'] : 0 );
		$product->set_stock_status( ( isset( $p['stock'] ) ? (int) $p['stock'] : 0 ) > 0 ? 'instock' : 'outofstock' );

		if ( isset( $cat_ids[ $p['category'] ] ) ) {
			$product->set_category_ids( array( $cat_ids[ $p['category'] ] ) );
		}

		$imgs = array();
		foreach ( (array) $p['images'] as $f ) {
			$aid = self::attachment_for( $f, $count );
			if ( $aid ) {
				$imgs[] = $aid;
			}
		}
		if ( $imgs ) {
			$product->set_image_id( $imgs[0] );
			$product->set_gallery_image_ids( array_slice( $imgs, 1 ) );
		}

		$pid = $product->save();
		if ( ! $pid ) {
			return false;
		}

		update_post_meta( $pid, 'gd_name_en', sanitize_text_field( $p['name_en'] ) );
		update_post_meta( $pid, 'gd_description_en', wp_kses_post( $p['description_en'] ) );
		update_post_meta( $pid, 'gd_brand', sanitize_text_field( $p['brand'] ) );
		update_post_meta( $pid, 'gd_badge', sanitize_text_field( isset( $p['badge'] ) ? $p['badge'] : '' ) );
		update_post_meta( $pid, 'gd_warranty', sanitize_text_field( isset( $p['warranty'] ) ? $p['warranty'] : '' ) );
		update_post_meta( $pid, 'gd_is_flash', ! empty( $p['is_flash_deal'] ) ? 1 : 0 );
		update_post_meta( $pid, 'gd_features', implode( "\n", array_map( 'sanitize_text_field', (array) $p['features'] ) ) );

		$specs = array();
		foreach ( (array) $p['specifications'] as $k => $v ) {
			$specs[] = sanitize_text_field( $k ) . ': ' . sanitize_text_field( $v );
		}
		update_post_meta( $pid, 'gd_specs', implode( "\n", $specs ) );

		$opts = array();
		foreach ( (array) ( isset( $p['variants'] ) ? $p['variants'] : array() ) as $v ) {
			$opts[] = sanitize_text_field( $v['name'] ) . ': ' . implode( ', ', array_map( 'sanitize_text_field', (array) $v['options'] ) );
		}
		update_post_meta( $pid, 'gd_options', implode( "\n", $opts ) );
		return true;
	}

	private static function seed_settings( $data, $overwrite, &$count ) {
		$images = isset( $data['_images'] ) ? (array) $data['_images'] : array();
		$map    = array();
		foreach ( $images as $key => $file ) {
			$map[ $key ] = self::attachment_for( $file, $count );
		}

		$saved = get_option( GD_Settings::OPTION, array() );
		$saved = is_array( $saved ) ? $saved : array();
		$input = array();
		foreach ( $data as $tab => $fields ) {
			if ( 0 === strpos( $tab, '_' ) || ! is_array( $fields ) || ! isset( GD_Settings::schema()[ $tab ] ) ) {
				continue;
			}
			if ( isset( $saved[ $tab ] ) && ! $overwrite ) {
				continue;
			}
			// ছবির কী → অ্যাটাচমেন্ট আইডি।
			foreach ( array( 'slides', 'banners' ) as $rk ) {
				if ( isset( $fields[ $rk ] ) && is_array( $fields[ $rk ] ) ) {
					foreach ( $fields[ $rk ] as $i => $row ) {
						if ( isset( $row['image'] ) && is_string( $row['image'] ) ) {
							$fields[ $rk ][ $i ]['image'] = isset( $map[ $row['image'] ] ) ? $map[ $row['image'] ] : 0;
						}
					}
				}
			}
			// স্কিমায় নেই এমন ফিল্ড বাদ; অনুপস্থিত ফিল্ড ডিফল্ট পাবে।
			$input[ $tab ] = $fields;
		}
		if ( $input ) {
			// register_setting-এর callback দুইবার চালানো এড়াতে সরিয়ে সরাসরি পরিষ্কার ডেটা সেভ করি।
			$clean = GD_Settings::sanitize_option( $input );
			remove_filter( 'sanitize_option_' . GD_Settings::OPTION, array( 'GD_Settings', 'sanitize_option' ) );
			update_option( GD_Settings::OPTION, $clean );
			add_filter( 'sanitize_option_' . GD_Settings::OPTION, array( 'GD_Settings', 'sanitize_option' ) );
		}
	}

	private static function seed_menus( $menus, $cat_ids, $overwrite, &$count ) {
		$locations = get_theme_mod( 'nav_menu_locations', array() );
		$locations = is_array( $locations ) ? $locations : array();
		foreach ( (array) $menus as $location => $items ) {
			if ( ! empty( $locations[ $location ] ) && ! $overwrite ) {
				continue;
			}
			$name    = 'GD ' . $location;
			$menu_ob = wp_get_nav_menu_object( $name );
			$menu_id = $menu_ob ? (int) $menu_ob->term_id : (int) wp_create_nav_menu( $name );
			if ( ! $menu_id || is_wp_error( $menu_id ) ) {
				continue;
			}
			// বিদ্যমান আইটেম মুছে নতুন করে সাজাই (idempotent)।
			foreach ( (array) wp_get_nav_menu_items( $menu_id ) as $old ) {
				wp_delete_post( $old->ID, true );
			}
			foreach ( (array) $items as $it ) {
				$args = array(
					'menu-item-title'  => sanitize_text_field( $it['title'] ),
					'menu-item-status' => 'publish',
				);
				if ( ! empty( $it['cat'] ) && isset( $cat_ids[ $it['cat'] ] ) ) {
					$args['menu-item-type']      = 'taxonomy';
					$args['menu-item-object']    = 'product_cat';
					$args['menu-item-object-id'] = $cat_ids[ $it['cat'] ];
				} elseif ( ! empty( $it['page'] ) ) {
					$page = get_page_by_path( $it['page'], OBJECT, 'page' );
					if ( ! $page ) {
						continue;
					}
					$args['menu-item-type']      = 'post_type';
					$args['menu-item-object']    = 'page';
					$args['menu-item-object-id'] = $page->ID;
				} elseif ( ! empty( $it['url'] ) ) {
					$args['menu-item-type'] = 'custom';
					$args['menu-item-url']  = esc_url_raw( home_url( $it['url'] ) );
				} else {
					continue;
				}
				wp_update_nav_menu_item( $menu_id, 0, $args );
			}
			$locations[ $location ] = $menu_id;
			$count['menus']++;
		}
		set_theme_mod( 'nav_menu_locations', $locations );
	}
}
