<?php
// প্লাগইন ডিলিট করলে সেটিংস রাখা হয় (ডেটা হারানো এড়াতে)। প্রয়োজনে নিচের লাইন আনকমেন্ট করুন।
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
// delete_option( 'gd_settings' );
