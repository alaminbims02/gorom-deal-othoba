<?php
/**
 * প্রোডাক্ট মেটা, ক্যাটাগরি টার্ম মেটা, পেজ মেটা, মেনু লোকেশন ও Woo REST এক্সটেনশন।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Meta {

	public static function init() {
		add_action( 'after_setup_theme', array( __CLASS__, 'register_menus' ), 20 );
		add_action( 'init', array( __CLASS__, 'register_menus' ), 20 );

		// প্রোডাক্ট।
		add_action( 'add_meta_boxes', array( __CLASS__, 'add_boxes' ) );
		add_action( 'save_post_product', array( __CLASS__, 'save_product' ), 10, 2 );
		add_action( 'save_post_page', array( __CLASS__, 'save_page' ), 10, 2 );

		// ক্যাটাগরি।
		add_action( 'product_cat_add_form_fields', array( __CLASS__, 'term_add_fields' ) );
		add_action( 'product_cat_edit_form_fields', array( __CLASS__, 'term_edit_fields' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'save_term' ) );
		add_action( 'edited_product_cat', array( __CLASS__, 'save_term' ) );

		// Woo REST এ gd অবজেক্ট।
		add_filter( 'woocommerce_rest_prepare_product_object', array( __CLASS__, 'rest_product' ), 10, 2 );
		add_filter( 'woocommerce_rest_prepare_product_cat', array( __CLASS__, 'rest_term' ), 10, 2 );
	}

	public static function register_menus() {
		register_nav_menus(
			array(
				'gd_header'        => 'GD Header (হেডার নেভিগেশন)',
				'gd_footer_col1'   => 'GD Footer Column 1',
				'gd_footer_col2'   => 'GD Footer Column 2',
				'gd_footer_policy' => 'GD Footer Policy Links',
			)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Product meta box                                                    */
	/* ------------------------------------------------------------------ */

	public static function add_boxes() {
		add_meta_box( 'gd_product', 'Gorom Deal — ফ্রন্টএন্ড তথ্য', array( __CLASS__, 'product_box' ), 'product', 'normal', 'default' );
		add_meta_box( 'gd_page', 'Gorom Deal — English সংস্করণ', array( __CLASS__, 'page_box' ), 'page', 'normal', 'default' );
	}

	public static function product_box( $post ) {
		wp_nonce_field( 'gd_product_save', 'gd_product_nonce' );
		$g = function ( $k ) use ( $post ) {
			return get_post_meta( $post->ID, $k, true );
		};
		$flash_end = (string) $g( 'gd_flash_end' );

		echo '<style>.gd-pbox label{display:block;font-weight:600;margin:10px 0 3px}.gd-pbox input[type=text],.gd-pbox input[type=datetime-local],.gd-pbox textarea{width:100%}</style>';
		echo '<div class="gd-pbox">';
		self::input( 'gd_name_en', 'পণ্যের নাম (English)', $g( 'gd_name_en' ) );
		self::textarea( 'gd_description_en', 'বিবরণ (English)', $g( 'gd_description_en' ), 4 );
		self::input( 'gd_brand', 'ব্র্যান্ড', $g( 'gd_brand' ) );
		self::input( 'gd_badge', 'ব্যাজ (যেমন: "ফ্ল্যাশ সেল", "নতুন") — কার্ডে দেখাবে', $g( 'gd_badge' ) );
		self::input( 'gd_warranty', 'ওয়ারেন্টি (যেমন: "২ বছর অফিশিয়াল ওয়ারেন্টি")', $g( 'gd_warranty' ) );
		self::textarea( 'gd_features', 'ফিচার তালিকা (প্রতি লাইনে একটি)', $g( 'gd_features' ), 5 );
		self::textarea( 'gd_specs', 'স্পেসিফিকেশন (প্রতি লাইনে "নাম: মান")', $g( 'gd_specs' ), 5 );
		self::textarea( 'gd_options', 'ভ্যারিয়েন্ট অপশন (প্রতি লাইনে "নাম: অপশন১, অপশন২" — যেমন "রঙ: কালো, সাদা")', $g( 'gd_options' ), 3 );
		echo '<label><input type="checkbox" name="gd_is_flash" value="1" ' . checked( (bool) $g( 'gd_is_flash' ), true, false ) . ' /> ফ্ল্যাশ ডিলে দেখান</label>';
		echo '<label for="gd_flash_end">ফ্ল্যাশ ডিল শেষ হবে (সাইটের সময় অনুযায়ী; ফাঁকা = কাউন্টডাউন নেই)</label>';
		printf( '<input type="datetime-local" id="gd_flash_end" name="gd_flash_end" value="%s" style="max-width:260px" />', esc_attr( $flash_end ) );
		echo '</div>';
	}

	private static function input( $key, $label, $val ) {
		printf( '<label for="%1$s">%2$s</label><input type="text" id="%1$s" name="%1$s" value="%3$s" />', esc_attr( $key ), esc_html( $label ), esc_attr( (string) $val ) );
	}

	private static function textarea( $key, $label, $val, $rows ) {
		printf( '<label for="%1$s">%2$s</label><textarea id="%1$s" name="%1$s" rows="%4$d">%3$s</textarea>', esc_attr( $key ), esc_html( $label ), esc_textarea( (string) $val ), (int) $rows );
	}

	private static function clean_lines( $raw ) {
		$lines = preg_split( '/\r\n|\r|\n/', (string) $raw );
		$out   = array();
		foreach ( (array) $lines as $l ) {
			$l = sanitize_text_field( $l );
			if ( '' !== $l ) {
				$out[] = $l;
			}
		}
		return implode( "\n", $out );
	}

	public static function save_product( $post_id, $post ) {
		if ( ! isset( $_POST['gd_product_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['gd_product_nonce'] ) ), 'gd_product_save' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$text = array( 'gd_name_en', 'gd_brand', 'gd_badge', 'gd_warranty' );
		foreach ( $text as $k ) {
			$v = isset( $_POST[ $k ] ) ? sanitize_text_field( wp_unslash( $_POST[ $k ] ) ) : '';
			update_post_meta( $post_id, $k, $v );
		}
		$desc = isset( $_POST['gd_description_en'] ) ? wp_kses_post( wp_unslash( $_POST['gd_description_en'] ) ) : '';
		update_post_meta( $post_id, 'gd_description_en', $desc );
		foreach ( array( 'gd_features', 'gd_specs', 'gd_options' ) as $k ) {
			$v = isset( $_POST[ $k ] ) ? self::clean_lines( wp_unslash( $_POST[ $k ] ) ) : '';
			update_post_meta( $post_id, $k, $v );
		}
		update_post_meta( $post_id, 'gd_is_flash', ! empty( $_POST['gd_is_flash'] ) ? 1 : 0 );
		$end = isset( $_POST['gd_flash_end'] ) ? sanitize_text_field( wp_unslash( $_POST['gd_flash_end'] ) ) : '';
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $end ) ) {
			$end = '';
		}
		update_post_meta( $post_id, 'gd_flash_end', $end );
	}

	/* ------------------------------------------------------------------ */
	/* Page meta                                                           */
	/* ------------------------------------------------------------------ */

	public static function page_box( $post ) {
		wp_nonce_field( 'gd_page_save', 'gd_page_nonce' );
		echo '<style>.gd-pbox label{display:block;font-weight:600;margin:10px 0 3px}.gd-pbox input[type=text],.gd-pbox textarea{width:100%}</style><div class="gd-pbox">';
		self::input( 'gd_title_en', 'শিরোনাম (English)', get_post_meta( $post->ID, 'gd_title_en', true ) );
		self::textarea( 'gd_content_en', 'কনটেন্ট (English — HTML চলবে)', get_post_meta( $post->ID, 'gd_content_en', true ), 10 );
		echo '<p class="description">মূল এডিটরে বাংলা কনটেন্ট লিখুন। ফ্রন্টএন্ডে /page/&lt;slug&gt; এ এই পেজ দেখাবে।</p></div>';
	}

	public static function save_page( $post_id, $post ) {
		if ( ! isset( $_POST['gd_page_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['gd_page_nonce'] ) ), 'gd_page_save' ) ) {
			return;
		}
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		update_post_meta( $post_id, 'gd_title_en', isset( $_POST['gd_title_en'] ) ? sanitize_text_field( wp_unslash( $_POST['gd_title_en'] ) ) : '' );
		update_post_meta( $post_id, 'gd_content_en', isset( $_POST['gd_content_en'] ) ? wp_kses_post( wp_unslash( $_POST['gd_content_en'] ) ) : '' );
	}

	/* ------------------------------------------------------------------ */
	/* Category term meta                                                  */
	/* ------------------------------------------------------------------ */

	private static function icon_select( $selected ) {
		$html = '<select name="gd_icon" id="gd_icon"><option value="">— ডিফল্ট —</option>';
		foreach ( GD_Settings::category_icon_choices() as $k => $label ) {
			$html .= sprintf( '<option value="%s" %s>%s</option>', esc_attr( $k ), selected( $selected, $k, false ), esc_html( $label ) );
		}
		return $html . '</select>';
	}

	public static function term_add_fields() {
		wp_nonce_field( 'gd_term_save', 'gd_term_nonce' );
		echo '<div class="form-field"><label for="gd_name_en">নাম (English)</label><input type="text" name="gd_name_en" id="gd_name_en" /></div>';
		echo '<div class="form-field"><label for="gd_icon">আইকন (ফ্রন্টএন্ড)</label>' . self::icon_select( '' ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in helper.
		echo '<div class="form-field"><label for="gd_order">ক্রম (ছোট সংখ্যা আগে)</label><input type="number" name="gd_order" id="gd_order" value="0" /></div>';
	}

	public static function term_edit_fields( $term ) {
		wp_nonce_field( 'gd_term_save', 'gd_term_nonce' );
		$en    = get_term_meta( $term->term_id, 'gd_name_en', true );
		$icon  = get_term_meta( $term->term_id, 'gd_icon', true );
		$order = get_term_meta( $term->term_id, 'gd_order', true );
		echo '<tr class="form-field"><th><label for="gd_name_en">নাম (English)</label></th><td><input type="text" name="gd_name_en" id="gd_name_en" value="' . esc_attr( (string) $en ) . '" /></td></tr>';
		echo '<tr class="form-field"><th><label for="gd_icon">আইকন (ফ্রন্টএন্ড)</label></th><td>' . self::icon_select( (string) $icon ) . '</td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput
		echo '<tr class="form-field"><th><label for="gd_order">ক্রম</label></th><td><input type="number" name="gd_order" id="gd_order" value="' . esc_attr( (string) $order ) . '" /></td></tr>';
	}

	public static function save_term( $term_id ) {
		if ( ! isset( $_POST['gd_term_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['gd_term_nonce'] ) ), 'gd_term_save' ) ) {
			return;
		}
		if ( ! current_user_can( 'manage_product_terms' ) ) {
			return;
		}
		update_term_meta( $term_id, 'gd_name_en', isset( $_POST['gd_name_en'] ) ? sanitize_text_field( wp_unslash( $_POST['gd_name_en'] ) ) : '' );
		$icon = isset( $_POST['gd_icon'] ) ? sanitize_text_field( wp_unslash( $_POST['gd_icon'] ) ) : '';
		if ( '' !== $icon && ! isset( GD_Settings::category_icon_choices()[ $icon ] ) ) {
			$icon = '';
		}
		update_term_meta( $term_id, 'gd_icon', $icon );
		update_term_meta( $term_id, 'gd_order', isset( $_POST['gd_order'] ) ? (int) $_POST['gd_order'] : 0 );
	}

	/* ------------------------------------------------------------------ */
	/* Public data helpers                                                 */
	/* ------------------------------------------------------------------ */

	public static function lines( $raw ) {
		$out = array();
		foreach ( preg_split( '/\r\n|\r|\n/', (string) $raw ) as $l ) {
			$l = trim( $l );
			if ( '' !== $l ) {
				$out[] = $l;
			}
		}
		return $out;
	}

	/** "2026-11-01T18:00" (সাইটের টাইমজোন) → ISO 8601 */
	public static function flash_end_iso( $post_id ) {
		$raw = (string) get_post_meta( $post_id, 'gd_flash_end', true );
		if ( '' === $raw ) {
			return '';
		}
		try {
			$dt = new DateTime( $raw, wp_timezone() );
			return $dt->format( 'c' );
		} catch ( Exception $e ) {
			return '';
		}
	}

	public static function is_flash_active( $post_id ) {
		if ( ! get_post_meta( $post_id, 'gd_is_flash', true ) ) {
			return false;
		}
		$iso = self::flash_end_iso( $post_id );
		if ( '' === $iso ) {
			return true;
		}
		return strtotime( $iso ) > time();
	}

	public static function product_gd( $product_id ) {
		$specs = array();
		foreach ( self::lines( get_post_meta( $product_id, 'gd_specs', true ) ) as $l ) {
			$pos = strpos( $l, ':' );
			if ( false === $pos ) {
				continue;
			}
			$specs[] = array(
				'k' => trim( substr( $l, 0, $pos ) ),
				'v' => trim( substr( $l, $pos + 1 ) ),
			);
		}
		$options = array();
		foreach ( self::lines( get_post_meta( $product_id, 'gd_options', true ) ) as $l ) {
			$pos = strpos( $l, ':' );
			if ( false === $pos ) {
				continue;
			}
			$vals = array_values( array_filter( array_map( 'trim', explode( ',', substr( $l, $pos + 1 ) ) ), 'strlen' ) );
			if ( $vals ) {
				$options[] = array(
					'name'    => trim( substr( $l, 0, $pos ) ),
					'options' => $vals,
				);
			}
		}
		return array(
			'name_en'        => (string) get_post_meta( $product_id, 'gd_name_en', true ),
			'description_en' => (string) get_post_meta( $product_id, 'gd_description_en', true ),
			'brand'          => (string) get_post_meta( $product_id, 'gd_brand', true ),
			'badge'          => (string) get_post_meta( $product_id, 'gd_badge', true ),
			'warranty'       => (string) get_post_meta( $product_id, 'gd_warranty', true ),
			'features'       => self::lines( get_post_meta( $product_id, 'gd_features', true ) ),
			'specs'          => $specs,
			'options'        => $options,
			'is_flash_deal'  => (bool) get_post_meta( $product_id, 'gd_is_flash', true ),
			'flash_end'      => self::flash_end_iso( $product_id ),
		);
	}

	public static function term_gd( $term_id ) {
		return array(
			'name_en' => (string) get_term_meta( $term_id, 'gd_name_en', true ),
			'icon'    => (string) get_term_meta( $term_id, 'gd_icon', true ),
			'order'   => (int) get_term_meta( $term_id, 'gd_order', true ),
		);
	}

	public static function rest_product( $response, $object ) {
		if ( $response instanceof WP_REST_Response && $object instanceof WC_Product ) {
			$id = $object->is_type( 'variation' ) ? $object->get_parent_id() : $object->get_id();
			$response->data['gd'] = self::product_gd( $id );
		}
		return $response;
	}

	public static function rest_term( $response, $item ) {
		if ( $response instanceof WP_REST_Response && isset( $item->term_id ) ) {
			$response->data['gd'] = self::term_gd( $item->term_id );
		}
		return $response;
	}
}
