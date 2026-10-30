<?php
/**
 * REST রুট: /wp-json/gd/v1/ এবং CORS।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Rest {

	const NS = 'gd/v1';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'cors' ), 20, 4 );
		add_filter( 'rest_post_dispatch', array( __CLASS__, 'cache_headers' ), 10, 3 );
	}

	/* ------------------------------------------------------------------ */
	/* CORS                                                                */
	/* ------------------------------------------------------------------ */

	public static function allowed_origins() {
		$origins = array();
		$front   = (string) GD_Settings::get( 'integrations', 'frontend_url', '' );
		if ( '' !== $front ) {
			$origins[] = untrailingslashit( $front );
		}
		foreach ( (array) GD_Settings::get( 'integrations', 'cors_origins', array() ) as $o ) {
			$o = untrailingslashit( esc_url_raw( (string) $o ) );
			if ( '' !== $o ) {
				$origins[] = $o;
			}
		}
		return array_values( array_unique( $origins ) );
	}

	public static function cors( $served, $result, $request, $server ) {
		$route = $request instanceof WP_REST_Request ? $request->get_route() : '';
		if ( 0 !== strpos( $route, '/' . self::NS . '/' ) ) {
			return $served;
		}
		// WordPress-এর ডিফল্ট (যেকোনো অরিজিন) হেডার সরিয়ে শুধু কনফিগার করা অরিজিন অনুমোদন।
		if ( ! headers_sent() ) {
			header_remove( 'Access-Control-Allow-Origin' );
			header_remove( 'Access-Control-Allow-Methods' );
			header_remove( 'Access-Control-Allow-Credentials' );
			$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
			$origin = untrailingslashit( $origin );
			if ( '' !== $origin && in_array( $origin, self::allowed_origins(), true ) ) {
				header( 'Access-Control-Allow-Origin: ' . $origin );
				header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
				header( 'Access-Control-Allow-Headers: Content-Type, X-GD-Proxy-Key, X-GD-Client-IP' );
				header( 'Vary: Origin', false );
			}
		}
		return $served;
	}

	public static function cache_headers( $response, $server, $request ) {
		if ( $request instanceof WP_REST_Request && 'GET' === $request->get_method() ) {
			$route = $request->get_route();
			if ( preg_match( '#^/gd/v1/(settings|menu|categories)$#', $route ) ) {
				$response->header( 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300' );
			} elseif ( preg_match( '#^/gd/v1/track#', $route ) ) {
				$response->header( 'Cache-Control', 'no-store' );
			}
		}
		return $response;
	}

	/* ------------------------------------------------------------------ */
	/* Routes                                                              */
	/* ------------------------------------------------------------------ */

	public static function routes() {
		$pub = '__return_true';

		register_rest_route( self::NS, '/settings', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_settings' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/home', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_home' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/menu', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_menu' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/categories', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_categories' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/pages', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_pages' ), 'permission_callback' => $pub ) );
		register_rest_route(
			self::NS,
			'/page/(?P<slug>[a-z0-9\-_]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_page' ),
				'permission_callback' => $pub,
			)
		);
		register_rest_route( self::NS, '/quote', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'post_quote' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/coupon/validate', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'post_coupon' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/order', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'post_order' ), 'permission_callback' => $pub ) );
		register_rest_route( self::NS, '/track', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_track' ), 'permission_callback' => $pub ) );
	}

	private static function need_woo() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'gd_no_woo', 'WooCommerce is not active', array( 'status' => 503 ) );
		}
		return true;
	}

	/* ------------------------------------------------------------------ */
	/* Handlers                                                            */
	/* ------------------------------------------------------------------ */

	public static function get_settings() {
		return rest_ensure_response( GD_Settings::public_settings() );
	}

	public static function get_home() {
		$ok = self::need_woo();
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$set      = GD_Settings::all();
		$sections = array();
		foreach ( (array) $set['home']['sections'] as $i => $sec ) {
			if ( empty( $sec['enabled'] ) ) {
				continue;
			}
			$sections[] = array(
				'index'        => $i,
				'type'         => $sec['type'],
				'title'        => GD_Settings::format_value( array( 'type' => 'bi' ), $sec['title'] ),
				'category'     => (string) $sec['category'],
				'limit'        => max( 1, (int) $sec['limit'] ),
				'banner_index' => (int) $sec['banner_index'],
				'view_all'     => (string) $sec['view_all'],
			);
		}

		$flash_q = new WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => 40,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'orderby'        => 'date',
				'order'          => 'DESC',
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery
					array(
						'key'   => 'gd_is_flash',
						'value' => '1',
					),
				),
			)
		);
		$flash_ids = array();
		$soonest   = 0;
		foreach ( $flash_q->posts as $pid ) {
			if ( ! GD_Meta::is_flash_active( $pid ) ) {
				continue;
			}
			$product = wc_get_product( $pid );
			if ( ! $product || ! $product->is_visible() ) {
				continue;
			}
			$flash_ids[] = (int) $pid;
			$iso         = GD_Meta::flash_end_iso( $pid );
			if ( $iso ) {
				$ts = strtotime( $iso );
				if ( ! $soonest || $ts < $soonest ) {
					$soonest = $ts;
				}
			}
		}

		$tabs = array();
		foreach ( (array) $set['home']['featured_tabs'] as $t ) {
			$tabs[] = array(
				'label'      => GD_Settings::format_value( array( 'type' => 'bi' ), $t['label'] ),
				'categories' => array_values( array_filter( array_map( 'sanitize_title', explode( ',', (string) $t['categories'] ) ) ) ),
			);
		}

		return rest_ensure_response(
			array(
				'sections'        => $sections,
				'flash_ids'       => $flash_ids,
				'flash_ends_at'   => $soonest ? gmdate( 'c', $soonest ) : '',
				'featured_tabs'   => $tabs,
			)
		);
	}

	public static function get_categories() {
		$ok = self::need_woo();
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return rest_ensure_response( array() );
		}
		$out = array();
		foreach ( $terms as $t ) {
			if ( 'uncategorized' === $t->slug ) {
				continue;
			}
			$gd    = GD_Meta::term_gd( $t->term_id );
			$thumb = (int) get_term_meta( $t->term_id, 'thumbnail_id', true );
			$out[] = array(
				'id'      => (int) $t->term_id,
				'slug'    => $t->slug,
				'name'    => html_entity_decode( $t->name ),
				'name_en' => $gd['name_en'],
				'icon'    => $gd['icon'],
				'order'   => $gd['order'],
				'count'   => (int) $t->count,
				'parent'  => (int) $t->parent,
				'image'   => $thumb ? (string) wp_get_attachment_url( $thumb ) : '',
			);
		}
		usort(
			$out,
			function ( $a, $b ) {
				return $a['order'] === $b['order'] ? strcmp( $a['slug'], $b['slug'] ) : $a['order'] - $b['order'];
			}
		);
		return rest_ensure_response( $out );
	}

	/* ---- menu ---- */

	private static function split_title( $title ) {
		$title = html_entity_decode( (string) $title );
		if ( false !== strpos( $title, '|' ) ) {
			list( $bn, $en ) = array_map( 'trim', explode( '|', $title, 2 ) );
			return array( 'bn' => $bn, 'en' => $en );
		}
		return array( 'bn' => $title, 'en' => $title );
	}

	private static function menu_path( $item ) {
		$home = untrailingslashit( home_url() );
		if ( 'post_type' === $item->type && 'page' === $item->object ) {
			$p = get_post( (int) $item->object_id );
			if ( $p ) {
				return '/page/' . $p->post_name;
			}
		}
		if ( 'taxonomy' === $item->type && 'product_cat' === $item->object ) {
			$t = get_term( (int) $item->object_id, 'product_cat' );
			if ( $t && ! is_wp_error( $t ) ) {
				return '/category/' . $t->slug;
			}
		}
		if ( 'post_type' === $item->type && 'product' === $item->object ) {
			$p = get_post( (int) $item->object_id );
			if ( $p ) {
				return '/product/' . $p->post_name;
			}
		}
		$url = (string) $item->url;
		if ( '' !== $home && 0 === strpos( $url, $home ) ) {
			$rest = substr( $url, strlen( $home ) );
			return '' === $rest ? '/' : $rest;
		}
		return $url;
	}

	public static function build_menu( $location ) {
		$locations = get_nav_menu_locations();
		if ( empty( $locations[ $location ] ) ) {
			return array();
		}
		$items = wp_get_nav_menu_items( $locations[ $location ] );
		if ( ! $items ) {
			return array();
		}
		$by_parent = array();
		foreach ( $items as $it ) {
			// অপ্রকাশিত (ড্রাফ্ট) পেজের লিংক পাবলিক মেনুতে দেখাবো না।
			if ( 'post_type' === $it->type && in_array( $it->object, array( 'page', 'product' ), true ) && 'publish' !== get_post_status( (int) $it->object_id ) ) {
				continue;
			}
			$by_parent[ (int) $it->menu_item_parent ][] = $it;
		}
		$build = function ( $parent ) use ( &$build, &$by_parent ) {
			$out = array();
			if ( empty( $by_parent[ $parent ] ) ) {
				return $out;
			}
			foreach ( $by_parent[ $parent ] as $it ) {
				$path  = self::menu_path( $it );
				$out[] = array(
					'id'       => (int) $it->ID,
					'title'    => self::split_title( $it->title ),
					'path'     => $path,
					'external' => (bool) preg_match( '#^https?://#i', $path ),
					'target'   => (string) $it->target,
					'children' => $build( (int) $it->ID ),
				);
			}
			return $out;
		};
		return $build( 0 );
	}

	public static function get_menu() {
		$cached = get_transient( 'gd_public_menu' );
		if ( is_array( $cached ) ) {
			return rest_ensure_response( $cached );
		}
		$data = array(
			'header'        => self::build_menu( 'gd_header' ),
			'footer_col1'   => self::build_menu( 'gd_footer_col1' ),
			'footer_col2'   => self::build_menu( 'gd_footer_col2' ),
			'footer_policy' => self::build_menu( 'gd_footer_policy' ),
		);
		set_transient( 'gd_public_menu', $data, 10 * MINUTE_IN_SECONDS );
		return rest_ensure_response( $data );
	}

	/* ---- pages ---- */

	private static function page_payload( $post ) {
		$bn_content = apply_filters( 'the_content', $post->post_content );
		$en_title   = (string) get_post_meta( $post->ID, 'gd_title_en', true );
		$en_content = (string) get_post_meta( $post->ID, 'gd_content_en', true );
		return array(
			'id'       => (int) $post->ID,
			'slug'     => $post->post_name,
			'title'    => array(
				'bn' => html_entity_decode( get_the_title( $post ) ),
				'en' => '' !== $en_title ? $en_title : html_entity_decode( get_the_title( $post ) ),
			),
			'content'  => array(
				'bn' => wp_kses_post( $bn_content ),
				'en' => '' !== $en_content ? wp_kses_post( wpautop( $en_content ) ) : wp_kses_post( $bn_content ),
			),
			'modified' => get_post_modified_time( 'c', true, $post ),
		);
	}

	public static function get_page( WP_REST_Request $request ) {
		$slug = sanitize_title( $request['slug'] );
		$post = get_page_by_path( $slug, OBJECT, 'page' );
		if ( ! $post || 'publish' !== $post->post_status || post_password_required( $post ) ) {
			return new WP_Error( 'gd_not_found', 'Not found', array( 'status' => 404 ) );
		}
		return rest_ensure_response( self::page_payload( $post ) );
	}

	public static function get_pages() {
		$posts = get_posts(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'posts_per_page' => 100,
				'has_password'   => false,
				'orderby'        => 'menu_order title',
				'order'          => 'ASC',
			)
		);
		$out = array();
		foreach ( $posts as $p ) {
			$en    = (string) get_post_meta( $p->ID, 'gd_title_en', true );
			$out[] = array(
				'slug'     => $p->post_name,
				'title'    => array(
					'bn' => html_entity_decode( get_the_title( $p ) ),
					'en' => '' !== $en ? $en : html_entity_decode( get_the_title( $p ) ),
				),
				'modified' => get_post_modified_time( 'c', true, $p ),
			);
		}
		return rest_ensure_response( $out );
	}

	/* ---- commerce ---- */

	private static function body( WP_REST_Request $request ) {
		$json = $request->get_json_params();
		return is_array( $json ) ? $json : (array) $request->get_body_params();
	}

	public static function post_quote( WP_REST_Request $request ) {
		$ok = self::need_woo();
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$res = GD_Orders::quote( self::body( $request ) );
		return is_wp_error( $res ) ? $res : rest_ensure_response( $res );
	}

	public static function post_coupon( WP_REST_Request $request ) {
		$ok = self::need_woo();
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$data = self::body( $request );
		$lang = GD_Orders::lang( isset( $data['lang'] ) ? $data['lang'] : 'bn' );
		if ( GD_Orders::rate_limited( 'coupon:' . GD_Orders::client_ip( $request ), 60 ) ) {
			return GD_Orders::err( 'rate', 'অনেকগুলো অনুরোধ হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন', 'Too many requests, please try again later', $lang, 429 );
		}
		$subtotal = 0.0;
		if ( ! empty( $data['items'] ) ) {
			$built = GD_Orders::build_lines( $data['items'], $lang, false );
			if ( is_wp_error( $built ) ) {
				return $built;
			}
			$subtotal = $built['subtotal'];
		}
		$res = GD_Orders::check_coupon( isset( $data['code'] ) ? $data['code'] : '', $subtotal, $lang );
		return is_wp_error( $res ) ? $res : rest_ensure_response( $res );
	}

	public static function post_order( WP_REST_Request $request ) {
		$ok = self::need_woo();
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$res = GD_Orders::create( self::body( $request ), $request );
		return is_wp_error( $res ) ? $res : rest_ensure_response( $res );
	}

	public static function get_track( WP_REST_Request $request ) {
		$ok = self::need_woo();
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$res = GD_Orders::track(
			(string) $request->get_param( 'order' ),
			(string) $request->get_param( 'phone' ),
			(string) $request->get_param( 'lang' ),
			$request
		);
		return is_wp_error( $res ) ? $res : rest_ensure_response( $res );
	}
}
