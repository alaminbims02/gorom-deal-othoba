<?php
/**
 * কনটেন্ট বদলালে Next.js ফ্রন্টএন্ডের /api/revalidate এ ওয়েবহুক পাঠায়।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Revalidate {

	/** @var array */
	private static $tags = array();
	/** @var array */
	private static $paths = array();
	/** @var bool */
	private static $hooked_shutdown = false;

	public static function init() {
		add_action( 'save_post_product', array( __CLASS__, 'on_product' ), 20, 2 );
		add_action( 'trashed_post', array( __CLASS__, 'on_post_removed' ) );
		add_action( 'untrashed_post', array( __CLASS__, 'on_post_removed' ) );
		add_action( 'deleted_post', array( __CLASS__, 'on_post_removed' ) );
		add_action( 'woocommerce_product_set_stock', array( __CLASS__, 'on_stock' ) );
		add_action( 'woocommerce_variation_set_stock', array( __CLASS__, 'on_stock' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'on_term' ) );
		add_action( 'edited_product_cat', array( __CLASS__, 'on_term' ) );
		add_action( 'delete_product_cat', array( __CLASS__, 'on_term' ) );
		add_action( 'update_option_' . GD_Settings::OPTION, array( __CLASS__, 'on_settings' ) );
		add_action( 'add_option_' . GD_Settings::OPTION, array( __CLASS__, 'on_settings' ) );
		add_action( 'wp_update_nav_menu', array( __CLASS__, 'on_menu' ) );
		add_action( 'wp_update_nav_menu_item', array( __CLASS__, 'on_menu' ) );
		add_action( 'save_post_page', array( __CLASS__, 'on_page' ), 20, 2 );
	}

	/* ------------------------------------------------------------------ */
	/* Queueing                                                            */
	/* ------------------------------------------------------------------ */

	private static function queue( $tags, $paths = array() ) {
		if ( ! GD_Settings::get( 'integrations', 'webhook_enabled', 1 ) ) {
			return;
		}
		if ( '' === (string) GD_Settings::get( 'integrations', 'revalidate_url', '' ) ) {
			return;
		}
		self::$tags  = array_values( array_unique( array_merge( self::$tags, $tags ) ) );
		self::$paths = array_values( array_unique( array_merge( self::$paths, $paths ) ) );
		if ( ! self::$hooked_shutdown ) {
			self::$hooked_shutdown = true;
			add_action( 'shutdown', array( __CLASS__, 'flush' ) );
		}
	}

	public static function flush() {
		if ( ! self::$tags && ! self::$paths ) {
			return;
		}
		self::post( self::$tags, self::$paths, false );
		self::$tags  = array();
		self::$paths = array();
	}

	/* ------------------------------------------------------------------ */
	/* Hooks                                                               */
	/* ------------------------------------------------------------------ */

	public static function on_product( $post_id, $post ) {
		if ( wp_is_post_revision( $post_id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) {
			return;
		}
		$tags  = array( 'products', 'categories' );
		$paths = array( '/' );
		if ( $post && $post->post_name ) {
			$tags[]  = 'product:' . $post->post_name;
			$paths[] = '/product/' . $post->post_name;
		}
		self::queue( $tags, $paths );
	}

	public static function on_post_removed( $post_id ) {
		$type = get_post_type( $post_id );
		if ( 'product' === $type ) {
			self::queue( array( 'products', 'categories' ), array( '/' ) );
		} elseif ( 'page' === $type ) {
			self::queue( array( 'pages' ) );
		}
	}

	public static function on_stock( $product ) {
		$id = is_object( $product ) && method_exists( $product, 'get_id' ) ? $product->get_id() : 0;
		$tags = array( 'products' );
		if ( $id ) {
			$slug = get_post_field( 'post_name', $id );
			if ( $slug ) {
				$tags[] = 'product:' . $slug;
			}
		}
		self::queue( $tags );
	}

	public static function on_term() {
		self::queue( array( 'categories', 'products', 'menu' ), array( '/' ) );
	}

	public static function on_settings() {
		self::queue( array( 'settings', 'menu', 'products', 'categories', 'pages' ), array( '/' ) );
	}

	public static function on_menu() {
		delete_transient( 'gd_public_menu' );
		self::queue( array( 'menu' ) );
	}

	public static function on_page( $post_id, $post ) {
		if ( wp_is_post_revision( $post_id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) {
			return;
		}
		delete_transient( 'gd_public_menu' );
		$tags = array( 'pages', 'menu' );
		if ( $post && $post->post_name ) {
			$tags[] = 'page:' . $post->post_name;
		}
		self::queue( $tags );
	}

	/* ------------------------------------------------------------------ */
	/* Sending                                                             */
	/* ------------------------------------------------------------------ */

	/**
	 * @return string মানুষ-পাঠযোগ্য ফলাফল
	 */
	private static function post( $tags, $paths, $blocking ) {
		$url    = esc_url_raw( (string) GD_Settings::get( 'integrations', 'revalidate_url', '' ) );
		$secret = (string) GD_Settings::get( 'integrations', 'revalidate_secret', '' );
		if ( '' === $url ) {
			return 'রিভ্যালিডেট URL সেট করা নেই';
		}
		if ( '' === $secret ) {
			return 'REVALIDATE_SECRET সেট করা নেই';
		}
		$response = wp_remote_post(
			$url,
			array(
				'timeout'  => $blocking ? 10 : 1,
				'blocking' => $blocking,
				'headers'  => array(
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . $secret,
				),
				'body'     => wp_json_encode(
					array(
						'secret' => $secret,
						'tags'   => array_values( $tags ),
						'paths'  => array_values( $paths ),
					)
				),
			)
		);
		if ( is_wp_error( $response ) ) {
			$result = 'ব্যর্থ: ' . $response->get_error_message();
		} elseif ( ! $blocking ) {
			$result = 'পাঠানো হয়েছে (non-blocking)';
		} else {
			$code   = (int) wp_remote_retrieve_response_code( $response );
			$result = ( $code >= 200 && $code < 300 ) ? 'সফল (HTTP ' . $code . ')' : 'ব্যর্থ (HTTP ' . $code . ')';
		}
		set_transient(
			'gd_last_revalidate',
			array(
				'time'   => wp_date( 'Y-m-d H:i:s' ),
				'result' => $result,
			),
			DAY_IN_SECONDS
		);
		return $result;
	}

	public static function send_now( $tags, $paths ) {
		return self::post( $tags, $paths, true );
	}
}
