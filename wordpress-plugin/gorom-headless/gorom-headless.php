<?php
/**
 * Plugin Name:       Gorom Headless
 * Description:       গরম ডিল হেডলেস WooCommerce ব্যাকএন্ড — Next.js ফ্রন্টএন্ডের সব কনটেন্ট, সেটিংস, অর্ডার API ও রিভ্যালিডেশন ওয়েবহুক এখান থেকে নিয়ন্ত্রণ করুন।
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Gorom Deal
 * License:           GPL-2.0-or-later
 * Text Domain:       gorom-headless
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GD_VERSION', '1.0.0' );
define( 'GD_FILE', __FILE__ );
define( 'GD_DIR', plugin_dir_path( __FILE__ ) );
define( 'GD_URL', plugin_dir_url( __FILE__ ) );

require_once GD_DIR . 'includes/class-gd-settings.php';
require_once GD_DIR . 'includes/class-gd-admin.php';
require_once GD_DIR . 'includes/class-gd-meta.php';
require_once GD_DIR . 'includes/class-gd-orders.php';
require_once GD_DIR . 'includes/class-gd-rest.php';
require_once GD_DIR . 'includes/class-gd-revalidate.php';
require_once GD_DIR . 'includes/class-gd-seed.php';

/**
 * WooCommerce নেই হলে অ্যাডমিন নোটিস দেখান।
 */
function gd_woocommerce_missing_notice() {
	if ( class_exists( 'WooCommerce' ) || ! current_user_can( 'activate_plugins' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p><strong>Gorom Headless:</strong> ' . esc_html__( 'এই প্লাগইন চালাতে WooCommerce ইনস্টল ও অ্যাক্টিভ থাকতে হবে।', 'gorom-headless' ) . '</p></div>';
}
add_action( 'admin_notices', 'gd_woocommerce_missing_notice' );

/**
 * বুটস্ট্র্যাপ।
 */
function gd_boot() {
	GD_Settings::init();
	GD_Admin::init();
	GD_Meta::init();
	GD_Rest::init();
	GD_Revalidate::init();
	GD_Seed::init();
}
add_action( 'plugins_loaded', 'gd_boot' );

register_activation_hook(
	__FILE__,
	function () {
		if ( false === get_option( GD_Settings::OPTION, false ) ) {
			add_option( GD_Settings::OPTION, array() );
		}
	}
);
