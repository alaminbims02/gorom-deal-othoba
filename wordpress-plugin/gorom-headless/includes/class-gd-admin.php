<?php
/**
 * অ্যাডমিন মেনু, সেটিংস পেজ ও ফিল্ড রেন্ডারার।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'admin_post_gd_seed_run', array( __CLASS__, 'handle_seed' ) );
		add_action( 'admin_post_gd_revalidate_now', array( __CLASS__, 'handle_revalidate' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( GD_FILE ), array( __CLASS__, 'action_links' ) );
	}

	public static function action_links( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'admin.php?page=gd-general' ) ) . '">' . esc_html__( 'Settings', 'gorom-headless' ) . '</a>' );
		return $links;
	}

	public static function menu() {
		add_menu_page( 'Gorom Headless', 'Gorom Headless', 'manage_options', 'gd-general', array( __CLASS__, 'render_page' ), 'dashicons-store', 56 );
		foreach ( GD_Settings::schema() as $tab => $def ) {
			add_submenu_page( 'gd-general', $def['label'], $def['label'], 'manage_options', 'gd-' . $tab, array( __CLASS__, 'render_page' ) );
		}
		// প্রথম সাবমেনু ডুপ্লিকেট হয় — সরিয়ে দিই।
		remove_submenu_page( 'gd-general', 'gd-general' );
		add_submenu_page( 'gd-general', 'সাইট আইডেন্টিটি', 'সাইট আইডেন্টিটি', 'manage_options', 'gd-general', array( __CLASS__, 'render_page' ) );
	}

	public static function assets( $hook ) {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		if ( 0 !== strpos( $page, 'gd-' ) ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_style( 'gd-admin', GD_URL . 'assets/admin.css', array(), GD_VERSION );
		wp_enqueue_script( 'gd-admin', GD_URL . 'assets/admin.js', array( 'jquery', 'wp-color-picker' ), GD_VERSION, true );
	}

	private static function current_tab() {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : 'gd-general'; // phpcs:ignore WordPress.Security.NonceVerification
		$tab  = preg_replace( '/^gd-/', '', $page );
		return isset( GD_Settings::schema()[ $tab ] ) ? $tab : 'general';
	}

	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'gorom-headless' ) );
		}
		$tab    = self::current_tab();
		$schema = GD_Settings::schema();
		$def    = $schema[ $tab ];
		$values = GD_Settings::all();
		$tabv   = $values[ $tab ];

		echo '<div class="wrap gd-wrap">';
		echo '<h1>Gorom Headless — ' . esc_html( $def['label'] ) . '</h1>';
		settings_errors();
		if ( ! empty( $def['help'] ) ) {
			echo '<p class="description gd-help">' . esc_html( $def['help'] ) . '</p>';
		}

		// ট্যাব নেভিগেশন।
		echo '<h2 class="nav-tab-wrapper gd-tabs">';
		foreach ( $schema as $t => $d ) {
			printf(
				'<a class="nav-tab %s" href="%s">%s</a>',
				esc_attr( $t === $tab ? 'nav-tab-active' : '' ),
				esc_url( admin_url( 'admin.php?page=gd-' . $t ) ),
				esc_html( $d['label'] )
			);
		}
		echo '</h2>';

		if ( isset( $_GET['gd_msg'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			$msg = sanitize_text_field( rawurldecode( wp_unslash( $_GET['gd_msg'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
			echo '<div class="notice notice-info is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
		}

		echo '<form method="post" action="options.php" class="gd-form">';
		settings_fields( 'gd_settings_group' );
		echo '<table class="form-table gd-table" role="presentation"><tbody>';
		foreach ( $def['fields'] as $key => $fdef ) {
			$name = GD_Settings::OPTION . '[' . $tab . '][' . $key . ']';
			$val  = isset( $tabv[ $key ] ) ? $tabv[ $key ] : null;
			echo '<tr><th scope="row">' . esc_html( $fdef['label'] ) . '</th><td>';
			self::render_field( $name, $fdef, $val );
			echo '</td></tr>';
		}
		echo '</tbody></table>';
		submit_button( 'সেভ করুন' );
		echo '</form>';

		if ( 'integrations' === $tab ) {
			self::render_integration_tools();
		}
		echo '</div>';
	}

	/* ------------------------------------------------------------------ */
	/* Field rendering                                                     */
	/* ------------------------------------------------------------------ */

	public static function render_field( $name, $def, $val ) {
		$type = $def['type'];
		switch ( $type ) {
			case 'bi':
			case 'bi_textarea':
				$val   = is_array( $val ) ? $val : array();
				$hint  = isset( $def['hint'] ) && is_array( $def['hint'] ) ? $def['hint'] : array();
				$tag   = 'bi_textarea' === $type ? 'textarea' : 'input';
				echo '<div class="gd-bi">';
				foreach ( array( 'bn' => 'বাংলা', 'en' => 'English' ) as $lang => $lbl ) {
					$v  = isset( $val[ $lang ] ) ? $val[ $lang ] : '';
					$ph = isset( $hint[ $lang ] ) ? $hint[ $lang ] : '';
					echo '<label class="gd-bi-col"><span class="gd-lang">' . esc_html( $lbl ) . '</span>';
					if ( 'textarea' === $tag ) {
						printf( '<textarea name="%s[%s]" rows="3" class="large-text" placeholder="%s">%s</textarea>', esc_attr( $name ), esc_attr( $lang ), esc_attr( $ph ), esc_textarea( $v ) );
					} else {
						printf( '<input type="text" name="%s[%s]" value="%s" class="regular-text" placeholder="%s" />', esc_attr( $name ), esc_attr( $lang ), esc_attr( $v ), esc_attr( $ph ) );
					}
					echo '</label>';
				}
				echo '</div>';
				break;

			case 'textarea':
				printf( '<textarea name="%s" rows="4" class="large-text">%s</textarea>', esc_attr( $name ), esc_textarea( (string) $val ) );
				break;

			case 'lines':
				printf( '<textarea name="%s" rows="4" class="large-text code">%s</textarea>', esc_attr( $name ), esc_textarea( implode( "\n", (array) $val ) ) );
				break;

			case 'checkbox':
				printf(
					'<input type="hidden" name="%1$s" value="0" /><label><input type="checkbox" name="%1$s" value="1" %2$s /> %3$s</label>',
					esc_attr( $name ),
					checked( ! empty( $val ), true, false ),
					esc_html__( 'চালু', 'gorom-headless' )
				);
				break;

			case 'number':
				printf( '<input type="number" step="any" name="%s" value="%s" class="small-text" />', esc_attr( $name ), esc_attr( (string) $val ) );
				break;

			case 'url':
				printf( '<input type="url" name="%s" value="%s" class="regular-text code" />', esc_attr( $name ), esc_attr( (string) $val ) );
				break;

			case 'password':
				printf( '<input type="password" name="%s" value="%s" class="regular-text code" autocomplete="new-password" />', esc_attr( $name ), esc_attr( (string) $val ) );
				break;

			case 'color':
				printf( '<input type="text" name="%s" value="%s" class="gd-color" data-default-color="%s" />', esc_attr( $name ), esc_attr( (string) $val ), esc_attr( isset( $def['default'] ) ? $def['default'] : '' ) );
				break;

			case 'select':
				printf( '<select name="%s">', esc_attr( $name ) );
				foreach ( $def['options'] as $k => $label ) {
					printf( '<option value="%s" %s>%s</option>', esc_attr( $k ), selected( (string) $val, (string) $k, false ), esc_html( $label ) );
				}
				echo '</select>';
				break;

			case 'category':
				self::render_category_select( $name, (string) $val );
				break;

			case 'image':
				self::render_image( $name, absint( $val ) );
				break;

			case 'repeater':
				self::render_repeater( $name, $def, is_array( $val ) ? $val : array() );
				break;

			case 'text':
			default:
				printf( '<input type="text" name="%s" value="%s" class="regular-text" />', esc_attr( $name ), esc_attr( (string) $val ) );
		}
	}

	private static function render_category_select( $name, $val ) {
		$terms = function_exists( 'WC' ) ? get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) ) : array();
		printf( '<select name="%s"><option value="">— নির্বাচন করুন —</option>', esc_attr( $name ) );
		if ( ! is_wp_error( $terms ) ) {
			foreach ( (array) $terms as $t ) {
				printf( '<option value="%s" %s>%s</option>', esc_attr( $t->slug ), selected( $val, $t->slug, false ), esc_html( $t->name ) );
			}
		}
		echo '</select>';
	}

	private static function render_image( $name, $id ) {
		$url = $id ? wp_get_attachment_image_url( $id, 'thumbnail' ) : '';
		echo '<div class="gd-image">';
		printf( '<input type="hidden" class="gd-image-id" name="%s" value="%d" />', esc_attr( $name ), (int) $id );
		echo '<div class="gd-image-preview">';
		if ( $url ) {
			printf( '<img src="%s" alt="" />', esc_url( $url ) );
		}
		echo '</div>';
		echo '<button type="button" class="button gd-image-pick">ছবি নির্বাচন</button> ';
		echo '<button type="button" class="button-link gd-image-clear">মুছুন</button>';
		echo '</div>';
	}

	private static function render_repeater_row( $name, $def, $index, $row ) {
		$title_key = isset( $def['row_label'] ) ? $def['row_label'] : '';
		$title     = '';
		if ( $title_key && isset( $row[ $title_key ] ) ) {
			$t     = $row[ $title_key ];
			$title = is_array( $t ) ? ( ! empty( $t['bn'] ) ? $t['bn'] : ( isset( $t['en'] ) ? $t['en'] : '' ) ) : (string) $t;
		}
		echo '<div class="gd-row"><div class="gd-row-head">';
		echo '<strong class="gd-row-title">' . esc_html( wp_trim_words( $title, 8, '…' ) ) . '</strong>';
		echo '<span class="gd-row-actions">';
		echo '<button type="button" class="button-link gd-row-up" title="উপরে">↑</button> ';
		echo '<button type="button" class="button-link gd-row-down" title="নিচে">↓</button> ';
		echo '<button type="button" class="button-link gd-row-toggle">বদলান</button> ';
		echo '<button type="button" class="button-link button-link-delete gd-row-del">মুছুন</button>';
		echo '</span></div><div class="gd-row-body"><table class="form-table gd-subtable"><tbody>';
		foreach ( $def['fields'] as $k => $sub ) {
			$subname = $name . '[' . $index . '][' . $k . ']';
			$sv      = isset( $row[ $k ] ) ? $row[ $k ] : ( isset( $sub['default'] ) ? $sub['default'] : null );
			echo '<tr><th scope="row">' . esc_html( $sub['label'] ) . '</th><td>';
			self::render_field( $subname, $sub, $sv );
			echo '</td></tr>';
		}
		echo '</tbody></table></div></div>';
	}

	private static function render_repeater( $name, $def, $rows ) {
		echo '<div class="gd-repeater" data-name="' . esc_attr( $name ) . '">';
		// ফাঁকা রিপিটার সাবমিট করলে যেন খালি তালিকা সেভ হয়, সেজন্য মার্কার।
		printf( '<input type="hidden" name="%s[__keep]" value="1" />', esc_attr( $name ) );
		echo '<div class="gd-rows">';
		$i = 0;
		foreach ( $rows as $row ) {
			if ( is_array( $row ) ) {
				self::render_repeater_row( $name, $def, $i, $row );
				$i++;
			}
		}
		echo '</div>';
		echo '<script type="text/template" class="gd-row-template">';
		ob_start();
		self::render_repeater_row( $name, $def, '__INDEX__', array() );
		echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput -- already escaped by renderers.
		echo '</script>';
		echo '<p><button type="button" class="button gd-row-add">+ নতুন যোগ করুন</button></p>';
		echo '</div>';
	}

	/* ------------------------------------------------------------------ */
	/* Integrations tab tools                                              */
	/* ------------------------------------------------------------------ */

	private static function render_integration_tools() {
		echo '<hr /><h2>টুলস</h2>';

		echo '<h3>ডেমো কনটেন্ট ইমপোর্ট (Seed)</h3>';
		echo '<p class="description">ক্যাটাগরি, ১০টি পণ্য (ছবি সহ), হিরো স্লাইড, প্রোমো, ট্রাস্ট ফিচার, জেলা, কুপন (GOROM10, GOROMDEAL) ও মেনু ইমপোর্ট করে। একাধিকবার চালালেও ডুপ্লিকেট হয় না (SKU/slug দিয়ে মেলানো)। কোনো ফেক রেটিং/রিভিউ ইমপোর্ট হয় না।</p>';
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
		wp_nonce_field( 'gd_seed_run' );
		echo '<input type="hidden" name="action" value="gd_seed_run" />';
		echo '<label><input type="checkbox" name="overwrite_settings" value="1" /> বিদ্যমান সেটিংস ওভাররাইট করুন (সাধারণত দরকার নেই)</label><br /><br />';
		submit_button( 'ডেমো ডেটা ইমপোর্ট করুন', 'secondary', 'submit', false );
		echo '</form>';

		echo '<h3 style="margin-top:2em">রিভ্যালিডেশন টেস্ট</h3>';
		$status = get_transient( 'gd_last_revalidate' );
		if ( is_array( $status ) ) {
			echo '<p>সর্বশেষ: <code>' . esc_html( $status['time'] . ' — ' . $status['result'] ) . '</code></p>';
		}
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
		wp_nonce_field( 'gd_revalidate_now' );
		echo '<input type="hidden" name="action" value="gd_revalidate_now" />';
		submit_button( 'এখনই সব ক্যাশ রিভ্যালিডেট করুন', 'secondary', 'submit', false );
		echo '</form>';

		echo '<h3 style="margin-top:2em">API ঠিকানা</h3>';
		echo '<p><code>' . esc_html( rest_url( 'gd/v1/settings' ) ) . '</code></p>';
	}

	public static function handle_seed() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Forbidden', 'gorom-headless' ), '', array( 'response' => 403 ) );
		}
		check_admin_referer( 'gd_seed_run' );
		$overwrite = ! empty( $_POST['overwrite_settings'] );
		$report    = GD_Seed::run( array( 'overwrite_settings' => $overwrite ) );
		wp_safe_redirect( add_query_arg( 'gd_msg', rawurlencode( $report ), admin_url( 'admin.php?page=gd-integrations' ) ) );
		exit;
	}

	public static function handle_revalidate() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Forbidden', 'gorom-headless' ), '', array( 'response' => 403 ) );
		}
		check_admin_referer( 'gd_revalidate_now' );
		$result = GD_Revalidate::send_now( array( 'settings', 'menu', 'products', 'categories', 'pages' ), array( '/' ) );
		wp_safe_redirect( add_query_arg( 'gd_msg', rawurlencode( $result ), admin_url( 'admin.php?page=gd-integrations' ) ) );
		exit;
	}
}
