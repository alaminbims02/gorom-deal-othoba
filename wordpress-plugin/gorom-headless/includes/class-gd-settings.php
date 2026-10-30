<?php
/**
 * সেটিংস স্কিমা, ডিফল্ট, স্যানিটাইজেশন ও পাবলিক ফরম্যাট।
 *
 * @package GoromHeadless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GD_Settings {

	const OPTION = 'gd_settings';

	/** @var array|null */
	private static $schema = null;

	public static function init() {
		register_setting(
			'gd_settings_group',
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_option' ),
				'default'           => array(),
			)
		);
		add_filter( 'option_page_capability_gd_settings_group', array( __CLASS__, 'capability' ) );
		add_action( 'update_option_' . self::OPTION, array( __CLASS__, 'flush_cache' ) );
		add_action( 'add_option_' . self::OPTION, array( __CLASS__, 'flush_cache' ) );
	}

	public static function capability() {
		return 'manage_options';
	}

	public static function flush_cache() {
		delete_transient( 'gd_public_settings' );
		delete_transient( 'gd_public_menu' );
	}

	/* ------------------------------------------------------------------ */
	/* Schema                                                              */
	/* ------------------------------------------------------------------ */

	/** দ্বিভাষিক ফিল্ড হেল্পার */
	private static function bi( $label, $bn = '', $en = '', $type = 'bi' ) {
		return array(
			'type'    => $type,
			'label'   => $label,
			'default' => array(
				'bn' => $bn,
				'en' => $en,
			),
		);
	}

	public static function ui_strings() {
		static $strings = null;
		if ( null === $strings ) {
			$file    = GD_DIR . 'data/ui-strings.json';
			$strings = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
			if ( ! is_array( $strings ) ) {
				$strings = array();
			}
		}
		return $strings;
	}

	public static function icon_choices() {
		return array(
			'Truck'       => 'Truck (ডেলিভারি)',
			'ShieldCheck' => 'ShieldCheck (গ্যারান্টি)',
			'Headphones'  => 'Headphones (সাপোর্ট)',
			'RotateCcw'   => 'RotateCcw (রিটার্ন)',
			'BadgeCheck'  => 'BadgeCheck',
			'Phone'       => 'Phone',
			'Clock'       => 'Clock',
			'Gift'        => 'Gift',
			'CreditCard'  => 'CreditCard',
			'Percent'     => 'Percent',
			'Star'        => 'Star',
			'Zap'         => 'Zap',
			'Flame'       => 'Flame',
			'Package'     => 'Package',
			'Heart'       => 'Heart',
			'Sparkles'    => 'Sparkles',
		);
	}

	public static function category_icon_choices() {
		return array(
			'LayoutGrid'      => 'LayoutGrid',
			'UtensilsCrossed' => 'UtensilsCrossed (কিচেন)',
			'CookingPot'      => 'CookingPot (কুকওয়্যার)',
			'Cpu'             => 'Cpu (গ্যাজেট)',
			'Headphones'      => 'Headphones (অডিও)',
			'Watch'           => 'Watch (ওয়াচ)',
			'Zap'             => 'Zap (পাওয়ার)',
			'Smartphone'      => 'Smartphone',
			'Laptop'          => 'Laptop',
			'Tv'              => 'Tv',
			'Home'            => 'Home',
			'Shirt'           => 'Shirt',
			'Gift'            => 'Gift',
			'Camera'          => 'Camera',
			'Gamepad2'        => 'Gamepad2',
			'Fan'             => 'Fan',
			'Lamp'            => 'Lamp',
			'Package'         => 'Package',
			'Sparkles'        => 'Sparkles',
			'Flame'           => 'Flame',
		);
	}

	/**
	 * পুরো স্কিমা। tab => [label, fields => [key => def]]
	 */
	public static function schema() {
		if ( null !== self::$schema ) {
			return self::$schema;
		}

		$bi  = array( __CLASS__, 'bi' );
		$s   = array();
		$yn  = array( 'bn' => 'বাংলা', 'en' => 'English' );

		$s['general'] = array(
			'label'  => 'সাইট আইডেন্টিটি',
			'help'   => 'সাইটের নাম, লোগো, ডিফল্ট ভাষা ও ব্র্যান্ড কালার।',
			'fields' => array(
				'site_name'     => self::bi( 'সাইটের নাম', 'গরম ডিল', 'Gorom Deal' ),
				'tagline'       => self::bi( 'ট্যাগলাইন (লোগোর নিচে)', 'কিচেন ও গ্যাজেটসের সেরা হাট · Gorom Deal', 'Kitchen & Gadgets · Gorom Deal' ),
				'logo'          => array( 'type' => 'image', 'label' => 'লোগো (ফাঁকা রাখলে নিচের টেক্সট লোগো দেখাবে)' ),
				'logo_main'     => self::bi( 'টেক্সট লোগো — প্রথম অংশ', 'গরম', 'Gorom' ),
				'logo_accent'   => self::bi( 'টেক্সট লোগো — হাইলাইট অংশ (ব্র্যান্ড কালারে)', 'ডিল', 'Deal' ),
				'favicon'       => array( 'type' => 'image', 'label' => 'ফেভিকন' ),
				'default_lang'  => array( 'type' => 'select', 'label' => 'ডিফল্ট ভাষা', 'options' => $yn, 'default' => 'bn' ),
				'lang_toggle'   => array( 'type' => 'checkbox', 'label' => 'ভাষা পরিবর্তনের বাটন দেখান (বাংলা/English)', 'default' => 1 ),
				'color_brand'   => array( 'type' => 'color', 'label' => 'প্রধান কালার (Orange)', 'default' => '#F36B0B' ),
				'color_accent'  => array( 'type' => 'color', 'label' => 'অ্যাকসেন্ট কালার (Red)', 'default' => '#E93825' ),
				'color_ink'     => array( 'type' => 'color', 'label' => 'গাঢ় কালার (Charcoal)', 'default' => '#252525' ),
				'color_cream'   => array( 'type' => 'color', 'label' => 'ক্রিম ব্যাকগ্রাউন্ড', 'default' => '#FFF8F1' ),
				'color_mist'    => array( 'type' => 'color', 'label' => 'হালকা ধূসর', 'default' => '#F3F3F3' ),
			),
		);

		$s['topbar'] = array(
			'label'  => 'টপ বার ও টিকার',
			'help'   => 'হেডারের উপরের পাতলা বার এবং স্ক্রলিং টিকার।',
			'fields' => array(
				'enabled'        => array( 'type' => 'checkbox', 'label' => 'টপ বার চালু', 'default' => 1 ),
				'left_text'      => self::bi( 'বাম পাশের লেখা', '১০০% আসল পণ্যের গ্যারান্টি', '100% Authentic Products' ),
				'show_phone'     => array( 'type' => 'checkbox', 'label' => 'হটলাইন নম্বর দেখান', 'default' => 1 ),
				'show_track'     => array( 'type' => 'checkbox', 'label' => '"অর্ডার ট্র্যাক" লিংক দেখান', 'default' => 1 ),
				'ticker_enabled' => array( 'type' => 'checkbox', 'label' => 'টিকার চালু', 'default' => 0 ),
				'ticker_speed'   => array( 'type' => 'number', 'label' => 'টিকার স্পিড (সেকেন্ড/লুপ)', 'default' => 30 ),
				'ticker'         => array(
					'type'      => 'repeater',
					'label'     => 'টিকার আইটেম',
					'row_label' => 'text',
					'fields'    => array(
						'text' => self::bi( 'লেখা' ),
						'link' => array( 'type' => 'text', 'label' => 'লিংক (ঐচ্ছিক: /category/..., /page/... বা পূর্ণ URL)' ),
					),
				),
			),
		);

		$s['hero'] = array(
			'label'  => 'হিরো স্লাইড',
			'help'   => 'হোমপেজের বড় স্লাইডার। ক্রম পরিবর্তন করতে ↑ ↓ ব্যবহার করুন।',
			'fields' => array(
				'autoplay'      => array( 'type' => 'number', 'label' => 'অটো-প্লে (সেকেন্ড, ০ = বন্ধ)', 'default' => 6 ),
				'slides'        => array(
					'type'      => 'repeater',
					'label'     => 'স্লাইড',
					'row_label' => 'title',
					'fields'    => array(
						'enabled'  => array( 'type' => 'checkbox', 'label' => 'চালু', 'default' => 1 ),
						'tag'      => self::bi( 'ট্যাগ (ছোট লেখা)' ),
						'title'    => self::bi( 'শিরোনাম' ),
						'subtitle' => self::bi( 'সাব-টাইটেল', '', '', 'bi_textarea' ),
						'cta_text' => self::bi( 'বাটনের লেখা' ),
						'cta_link' => array( 'type' => 'text', 'label' => 'বাটনের লিংক (যেমন /category/all)' ),
						'badge'    => self::bi( 'ব্যাজ (ছবির উপর)' ),
						'image'    => array( 'type' => 'image', 'label' => 'ছবি' ),
					),
				),
				'points'        => array(
					'type'      => 'repeater',
					'label'     => 'হিরোর নিচের ছোট পয়েন্ট (যেমন ওয়ারেন্টি, COD)',
					'row_label' => 'text',
					'fields'    => array(
						'icon' => array( 'type' => 'select', 'label' => 'আইকন', 'options' => self::icon_choices(), 'default' => 'ShieldCheck' ),
						'text' => self::bi( 'লেখা' ),
					),
				),
			),
		);

		$s['promo'] = array(
			'label'  => 'প্রোমো ব্যানার',
			'help'   => 'হোম সেকশনে "প্রোমো" টাইপ সেকশন থেকে এগুলো দেখানো হয় (সেকশনে ব্যানার নম্বর দিন)।',
			'fields' => array(
				'banners' => array(
					'type'      => 'repeater',
					'label'     => 'ব্যানার',
					'row_label' => 'title',
					'fields'    => array(
						'enabled'   => array( 'type' => 'checkbox', 'label' => 'চালু', 'default' => 1 ),
						'pill'      => self::bi( 'লাল পিল লেখা' ),
						'pill2'     => self::bi( 'পিলের পাশের ছোট লেখা' ),
						'title'     => self::bi( 'শিরোনাম' ),
						'subtitle'  => self::bi( 'বিবরণ', '', '', 'bi_textarea' ),
						'cta_text'  => self::bi( 'বাটনের লেখা' ),
						'cta_link'  => array( 'type' => 'text', 'label' => 'বাটনের লিংক' ),
						'image'     => array( 'type' => 'image', 'label' => 'ছবি' ),
						'caption'   => self::bi( 'ছবির ক্যাপশন' ),
					),
				),
			),
		);

		$s['home'] = array(
			'label'  => 'হোম সেকশন',
			'help'   => 'হোমপেজের সেকশনের ক্রম, চালু/বন্ধ, কোন ক্যাটাগরি ও কয়টি পণ্য — সব এখান থেকে।',
			'fields' => array(
				'sections' => array(
					'type'      => 'repeater',
					'label'     => 'সেকশন (উপর থেকে নিচে)',
					'row_label' => 'type',
					'fields'    => array(
						'enabled'      => array( 'type' => 'checkbox', 'label' => 'চালু', 'default' => 1 ),
						'type'         => array(
							'type'    => 'select',
							'label'   => 'টাইপ',
							'options' => array(
								'hero'              => 'হিরো স্লাইডার',
								'categories'        => 'ক্যাটাগরি স্ট্রিপ',
								'flash_deals'       => 'ফ্ল্যাশ ডিল',
								'promo'             => 'প্রোমো ব্যানার',
								'featured'          => 'ফিচার্ড/ট্রেন্ডিং পণ্য (ট্যাব সহ)',
								'category_products' => 'নির্দিষ্ট ক্যাটাগরির পণ্য',
								'trust'             => 'ট্রাস্ট ফিচার বার',
							),
							'default' => 'hero',
						),
						'title'        => self::bi( 'সেকশন শিরোনাম (প্রযোজ্য হলে)' ),
						'category'     => array( 'type' => 'category', 'label' => 'ক্যাটাগরি (category_products-এর জন্য)' ),
						'limit'        => array( 'type' => 'number', 'label' => 'সর্বোচ্চ পণ্য সংখ্যা', 'default' => 8 ),
						'banner_index' => array( 'type' => 'number', 'label' => 'প্রোমো ব্যানার নম্বর (১,২,…; ০ = সবগুলো)', 'default' => 1 ),
						'view_all'     => array( 'type' => 'text', 'label' => '"সব দেখুন" লিংক (ফাঁকা = স্বয়ংক্রিয়)' ),
					),
					'default'   => array(
						array( 'enabled' => 1, 'type' => 'hero', 'limit' => 8, 'banner_index' => 1 ),
						array( 'enabled' => 1, 'type' => 'categories', 'limit' => 12, 'banner_index' => 1 ),
						array( 'enabled' => 1, 'type' => 'flash_deals', 'limit' => 4, 'banner_index' => 1 ),
						array( 'enabled' => 1, 'type' => 'promo', 'limit' => 8, 'banner_index' => 1 ),
						array( 'enabled' => 1, 'type' => 'featured', 'limit' => 8, 'banner_index' => 1 ),
						array( 'enabled' => 1, 'type' => 'trust', 'limit' => 8, 'banner_index' => 1 ),
					),
				),
				'featured_tabs' => array(
					'type'      => 'repeater',
					'label'     => 'ফিচার্ড সেকশনের ট্যাব (প্রথমটি সাধারণত "সব")',
					'row_label' => 'label',
					'fields'    => array(
						'label'      => self::bi( 'ট্যাবের নাম' ),
						'categories' => array( 'type' => 'text', 'label' => 'ক্যাটাগরি স্লাগ (কমা দিয়ে; ফাঁকা = সব পণ্য)' ),
					),
				),
			),
		);

		$s['trust'] = array(
			'label'  => 'ট্রাস্ট ফিচার',
			'help'   => 'হোমপেজের "দ্রুত ডেলিভারি / আসল পণ্য / সাপোর্ট / রিটার্ন" বার।',
			'fields' => array(
				'features' => array(
					'type'      => 'repeater',
					'label'     => 'ফিচার',
					'row_label' => 'title',
					'fields'    => array(
						'icon'  => array( 'type' => 'select', 'label' => 'আইকন', 'options' => self::icon_choices(), 'default' => 'Truck' ),
						'title' => self::bi( 'শিরোনাম' ),
						'desc'  => self::bi( 'বিবরণ' ),
					),
				),
			),
		);

		$s['contact'] = array(
			'label'  => 'যোগাযোগ ও সময়সূচি',
			'help'   => 'ঠিকানা, ফোন, ইমেইল, হোয়াটসঅ্যাপ ও ব্যবসার সময়।',
			'fields' => array(
				'address'  => self::bi( 'ঠিকানা', 'প্রাণ-আরএফএল সেন্টার, ১০৫ প্রগতি সরণি, মধ্য বাড্ডা, ঢাকা-১২১২', 'Pran-RFL Center, 105 Pragati Sarani, Middle Badda, Dhaka-1212', 'bi_textarea' ),
				'hotline'  => array( 'type' => 'text', 'label' => 'হটলাইন (দেখানোর জন্য)', 'default' => '09613-737726' ),
				'phone'    => array( 'type' => 'text', 'label' => 'ফোন (tel: লিংকের জন্য, ফাঁকা = হটলাইন)', 'default' => '' ),
				'hours'    => self::bi( 'ব্যবসার সময়', 'সকাল ৯টা - রাত ১০টা', '9am - 10pm' ),
				'email'    => array( 'type' => 'text', 'label' => 'ইমেইল', 'default' => 'support@goromdeal.com' ),
				'whatsapp' => array( 'type' => 'text', 'label' => 'হোয়াটসঅ্যাপ নম্বর (দেশ কোড সহ, যেমন 8801XXXXXXXXX)', 'default' => '' ),
				'map_url'  => array( 'type' => 'url', 'label' => 'গুগল ম্যাপ লিংক (ঐচ্ছিক)' ),
			),
		);

		$s['footer'] = array(
			'label'  => 'ফুটার',
			'help'   => 'ফুটারের লেখা, সোশ্যাল লিংক, ট্রেড লাইসেন্স ও DBID। কলাম লিংকগুলো Appearance → Menus থেকে নিয়ন্ত্রিত।',
			'fields' => array(
				'about'         => self::bi( 'ব্র্যান্ড পরিচিতি', '', '', 'bi_textarea' ),
				'col1_title'    => self::bi( 'কলাম ১ শিরোনাম (মেনু লোকেশন: GD Footer Column 1)', 'কিচেন আইটেমস', 'Kitchen Items' ),
				'col2_title'    => self::bi( 'কলাম ২ শিরোনাম (মেনু লোকেশন: GD Footer Column 2)', 'স্মার্ট গ্যাজেটস', 'Smart Gadgets' ),
				'col3_title'    => self::bi( 'কলাম ৩ শিরোনাম (পেমেন্ট/যোগাযোগ)', 'পেমেন্ট মাধ্যম', 'Accepted Payments' ),
				'payments'      => array(
					'type'      => 'repeater',
					'label'     => 'পেমেন্ট ব্যাজ (শুধু যেগুলো সত্যিই চালু)',
					'row_label' => 'label',
					'fields'    => array(
						'label' => array( 'type' => 'text', 'label' => 'নাম' ),
						'color' => array( 'type' => 'color', 'label' => 'ব্যাজ কালার', 'default' => '#444444' ),
					),
				),
				'facebook'      => array( 'type' => 'url', 'label' => 'Facebook URL' ),
				'instagram'     => array( 'type' => 'url', 'label' => 'Instagram URL' ),
				'youtube'       => array( 'type' => 'url', 'label' => 'YouTube URL' ),
				'tiktok'        => array( 'type' => 'url', 'label' => 'TikTok URL' ),
				'x'             => array( 'type' => 'url', 'label' => 'X (Twitter) URL' ),
				'trade_license' => array( 'type' => 'text', 'label' => 'ট্রেড লাইসেন্স নম্বর' ),
				'dbid'          => array( 'type' => 'text', 'label' => 'DBID (Digital Business ID)' ),
				'copyright'     => self::bi( 'কপিরাইট লেখা (বছরের আগে-পরে যোগ হবে না, পূর্ণ লেখা দিন)', 'গরম ডিল - Gorom Deal | কিচেন ও গ্যাজেটসের নির্ভরযোগ্য অনলাইন শপ।', 'Gorom Deal — your trusted kitchen & gadgets store.' ),
			),
		);

		$s['pages'] = array(
			'label'  => 'ক্যাটাগরি ও প্রোডাক্ট পেজ',
			'help'   => 'ক্যাটাগরি পেজের নিচের কনটেন্ট (আর্টিকেল, FAQ) এবং প্রোডাক্ট পেজের তথ্য বক্স।',
			'fields' => array(
				'cat_banner_tag'  => self::bi( 'ক্যাটাগরি ব্যানার: ছোট ট্যাগ' ),
				'cat_banner_desc' => self::bi( 'ক্যাটাগরি ব্যানার: ডিফল্ট বিবরণ (ক্যাটাগরির নিজস্ব Description থাকলে সেটি দেখাবে)', '', '', 'bi_textarea' ),
				'cat_points'       => array(
					'type'      => 'repeater',
					'label'     => 'ক্যাটাগরি ব্যানারের পয়েন্ট',
					'row_label' => 'text',
					'fields'    => array(
						'icon' => array( 'type' => 'select', 'label' => 'আইকন', 'options' => self::icon_choices(), 'default' => 'ShieldCheck' ),
						'text' => self::bi( 'লেখা' ),
					),
				),
				'cat_article_title' => self::bi( 'ক্যাটাগরি পেজের নিচের আর্টিকেল শিরোনাম' ),
				'cat_article_text'  => self::bi( 'আর্টিকেল টেক্সট', '', '', 'bi_textarea' ),
				'cat_value_props'   => array(
					'type'      => 'repeater',
					'label'     => 'ভ্যালু প্রপোজিশন বক্স',
					'row_label' => 'title',
					'fields'    => array(
						'title' => self::bi( 'শিরোনাম' ),
						'items' => self::bi( 'পয়েন্টগুলো (প্রতি লাইনে একটি)', '', '', 'bi_textarea' ),
					),
				),
				'faq'               => array(
					'type'      => 'repeater',
					'label'     => 'FAQ',
					'row_label' => 'q',
					'fields'    => array(
						'q' => self::bi( 'প্রশ্ন' ),
						'a' => self::bi( 'উত্তর', '', '', 'bi_textarea' ),
					),
				),
				'pdp_price_note'    => self::bi( 'প্রোডাক্ট পেজ: দামের নিচের নোট', '✓ ভ্যাট অন্তর্ভুক্ত · ক্যাশ অন ডেলিভারি প্রযোজ্য', '✓ VAT included · Cash on Delivery available' ),
				'pdp_ship_note'     => self::bi( 'প্রোডাক্ট পেজ: শিপিং নোট', 'আজ অর্ডার করলে আগামীকালের মধ্যে শিপিং', 'Ships within 24 hours' ),
				'pdp_delivery_info' => self::bi( 'প্রোডাক্ট পেজ: ডেলিভারি তথ্য (ফাঁকা = ডেলিভারি সেটিং থেকে স্বয়ংক্রিয়)', '', '', 'bi_textarea' ),
				'pdp_guarantee'     => self::bi( 'প্রোডাক্ট পেজ: ওয়ারেন্টির সাথে অতিরিক্ত লেখা', 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা।', 'Check the parcel at your doorstep upon delivery.' ),
				'pdp_badges'        => array(
					'type'      => 'repeater',
					'label'     => 'ছবির নিচের ব্যাজ (যেমন ১০০% অরিজিনাল)',
					'row_label' => 'text',
					'fields'    => array(
						'icon' => array( 'type' => 'select', 'label' => 'আইকন', 'options' => self::icon_choices(), 'default' => 'ShieldCheck' ),
						'text' => self::bi( 'লেখা' ),
					),
				),
			),
		);

		$s['seo'] = array(
			'label'  => 'SEO',
			'help'   => 'ডিফল্ট মেটা, OpenGraph ইমেজ ও robots সেটিং।',
			'fields' => array(
				'title_template'  => array( 'type' => 'text', 'label' => 'টাইটেল টেমপ্লেট (%s = পেজ শিরোনাম)', 'default' => '%s | গরম ডিল' ),
				'default_title'   => self::bi( 'হোমপেজ টাইটেল' ),
				'default_desc'    => self::bi( 'ডিফল্ট মেটা ডেসক্রিপশন', '', '', 'bi_textarea' ),
				'keywords'        => array( 'type' => 'text', 'label' => 'কীওয়ার্ড (কমা দিয়ে)' ),
				'og_image'        => array( 'type' => 'image', 'label' => 'ডিফল্ট OpenGraph ইমেজ' ),
				'twitter_handle'  => array( 'type' => 'text', 'label' => 'Twitter/X হ্যান্ডেল (যেমন @goromdeal)' ),
				'noindex'         => array( 'type' => 'checkbox', 'label' => 'সার্চ ইঞ্জিন ব্লক করুন (noindex — স্টেজিংয়ের জন্য)', 'default' => 0 ),
				'robots_disallow' => array( 'type' => 'lines', 'label' => 'robots.txt Disallow পাথ (প্রতি লাইনে একটি)', 'default' => array( '/api/', '/checkout', '/cart' ) ),
			),
		);

		$s['tracking'] = array(
			'label'  => 'ট্র্যাকিং',
			'help'   => 'শুধু আইডি দিন (স্ক্রিপ্ট ফ্রন্টএন্ড নিজেই লোড করবে)।',
			'fields' => array(
				'ga4'      => array( 'type' => 'text', 'label' => 'Google Analytics 4 ID (G-XXXXXXX)' ),
				'gtm'      => array( 'type' => 'text', 'label' => 'Google Tag Manager ID (GTM-XXXXXXX)' ),
				'fb_pixel' => array( 'type' => 'text', 'label' => 'Meta (Facebook) Pixel ID' ),
			),
		);

		$s['delivery'] = array(
			'label'  => 'ডেলিভারি চার্জ',
			'help'   => 'ডেলিভারি চার্জ সার্ভারে পুনর্গণনা হয়; ফ্রন্টএন্ডের দেখানো মান শুধু অনুমান।',
			'fields' => array(
				'mode'           => array(
					'type'    => 'select',
					'label'   => 'চার্জের উৎস',
					'options' => array(
						'custom' => 'এই প্লাগইনের সেটিং (ঢাকার ভিতরে/বাইরে)',
						'woo'    => 'WooCommerce শিপিং জোন (Flat Rate) — অবস্থান অনুযায়ী প্রথম ফ্ল্যাট রেট',
					),
					'default' => 'custom',
				),
				'inside_charge'  => array( 'type' => 'number', 'label' => 'ঢাকার ভিতরে (৳)', 'default' => 60 ),
				'outside_charge' => array( 'type' => 'number', 'label' => 'ঢাকার বাইরে (৳)', 'default' => 120 ),
				'free_enabled'   => array( 'type' => 'checkbox', 'label' => 'ফ্রি ডেলিভারি চালু', 'default' => 1 ),
				'free_threshold' => array( 'type' => 'number', 'label' => 'ফ্রি ডেলিভারির ন্যূনতম সাবটোটাল (৳)', 'default' => 2500 ),
				'inside_eta'     => self::bi( 'ঢাকার ভিতরে সময়', '২৪-৪৮ ঘণ্টা', '24-48 hrs' ),
				'outside_eta'    => self::bi( 'ঢাকার বাইরে সময়', '২-৩ দিন', '2-3 days' ),
			),
		);

		$districts = array(
			array( 'Dhaka', 'ঢাকা', 'inside' ),
			array( 'Chattogram', 'চট্টগ্রাম', 'outside' ),
			array( 'Rajshahi', 'রাজশাহী', 'outside' ),
			array( 'Khulna', 'খুলনা', 'outside' ),
			array( 'Sylhet', 'সিলেট', 'outside' ),
			array( 'Barishal', 'বরিশাল', 'outside' ),
			array( 'Rangpur', 'রংপুর', 'outside' ),
			array( 'Mymensingh', 'ময়মনসিংহ', 'outside' ),
			array( 'Cumilla', 'কুমিল্লা', 'outside' ),
			array( 'Bogura', 'বগুড়া', 'outside' ),
			array( 'Gazipur', 'গাজীপুর', 'outside' ),
			array( 'Narayanganj', 'নারায়ণগঞ্জ', 'outside' ),
		);
		$district_rows = array();
		foreach ( $districts as $d ) {
			$district_rows[] = array(
				'name_en' => $d[0],
				'name_bn' => $d[1],
				'zone'    => $d[2],
			);
		}

		$s['checkout'] = array(
			'label'  => 'চেকআউট',
			'help'   => 'জেলার তালিকা, COD, কনফার্মেশন বার্তা ও স্প্যাম সুরক্ষা।',
			'fields' => array(
				'cod_enabled'    => array( 'type' => 'checkbox', 'label' => 'ক্যাশ অন ডেলিভারি চালু', 'default' => 1 ),
				'districts'      => array(
					'type'      => 'repeater',
					'label'     => 'জেলার তালিকা',
					'row_label' => 'name_en',
					'fields'    => array(
						'name_en' => array( 'type' => 'text', 'label' => 'English নাম' ),
						'name_bn' => array( 'type' => 'text', 'label' => 'বাংলা নাম' ),
						'zone'    => array(
							'type'    => 'select',
							'label'   => 'ডেলিভারি জোন',
							'options' => array( 'inside' => 'ঢাকার ভিতরে', 'outside' => 'ঢাকার বাইরে' ),
							'default' => 'outside',
						),
					),
					'default'   => $district_rows,
				),
				'show_email'     => array( 'type' => 'checkbox', 'label' => 'ইমেইল ফিল্ড দেখান (ঐচ্ছিক ইনপুট)', 'default' => 0 ),
				'show_note'      => array( 'type' => 'checkbox', 'label' => 'অর্ডার নোট ফিল্ড দেখান', 'default' => 1 ),
				'min_order'      => array( 'type' => 'number', 'label' => 'ন্যূনতম অর্ডার (৳, ০ = সীমা নেই)', 'default' => 0 ),
				'confirm_title'  => self::bi( 'কনফার্মেশন শিরোনাম', 'ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে', 'Thank You! Your Order is Confirmed' ),
				'confirm_text'   => self::bi( 'কনফার্মেশন বার্তা', 'আমাদের কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি নিশ্চিত করবেন।', 'Our customer representative will call shortly to verify your order.', 'bi_textarea' ),
				'order_prefix'   => array( 'type' => 'text', 'label' => 'অর্ডার রেফারেন্স প্রিফিক্স', 'default' => 'GD-' ),
				'order_status'   => array(
					'type'    => 'select',
					'label'   => 'নতুন অর্ডারের স্ট্যাটাস',
					'options' => array( 'processing' => 'Processing', 'on-hold' => 'On hold', 'pending' => 'Pending payment' ),
					'default' => 'processing',
				),
				'rate_phone'     => array( 'type' => 'number', 'label' => 'প্রতি ফোনে ঘণ্টায় সর্বোচ্চ অর্ডার', 'default' => 5, 'private' => true ),
				'rate_ip'        => array( 'type' => 'number', 'label' => 'প্রতি IP-তে ঘণ্টায় সর্বোচ্চ অর্ডার', 'default' => 20, 'private' => true ),
				'dup_window'     => array( 'type' => 'number', 'label' => 'ডুপ্লিকেট অর্ডার চেক (মিনিট)', 'default' => 10, 'private' => true ),
			),
		);

		$s['integrations'] = array(
			'label'  => 'ফ্রন্টএন্ড কানেকশন',
			'help'   => 'Next.js সাইটের URL, CORS ও রিভ্যালিডেশন ওয়েবহুক।',
			'fields' => array(
				'frontend_url'    => array( 'type' => 'url', 'label' => 'ফ্রন্টএন্ড URL (যেমন https://goromdeal.com)', 'private' => true ),
				'cors_origins'    => array( 'type' => 'lines', 'label' => 'অতিরিক্ত CORS অরিজিন (প্রতি লাইনে একটি, যেমন http://localhost:3000)', 'private' => true ),
				'webhook_enabled' => array( 'type' => 'checkbox', 'label' => 'প্রোডাক্ট/সেটিংস সেভ হলে ফ্রন্টএন্ডে রিভ্যালিডেট পাঠান', 'default' => 1, 'private' => true ),
				'revalidate_url'  => array( 'type' => 'url', 'label' => 'রিভ্যালিডেট URL (যেমন https://goromdeal.com/api/revalidate)', 'private' => true ),
				'revalidate_secret' => array( 'type' => 'password', 'label' => 'REVALIDATE_SECRET (ফ্রন্টএন্ডের env-এর সাথে একই)', 'private' => true ),
				'proxy_secret'    => array( 'type' => 'password', 'label' => 'GD_PROXY_SECRET (ফ্রন্টএন্ডের env-এর সাথে একই; অর্ডারে আসল IP বিশ্বাস করতে)', 'private' => true ),
			),
		);

		// UI স্ট্রিং ওভাররাইড — প্রতিটি কী-র জন্য দ্বিভাষিক ফিল্ড।
		$string_fields = array();
		foreach ( self::ui_strings() as $key => $pair ) {
			$string_fields[ $key ] = array(
				'type'    => 'bi',
				'label'   => $key,
				'compact' => true,
				'hint'    => $pair,
			);
		}
		$s['strings'] = array(
			'label'  => 'UI টেক্সট',
			'help'   => 'বাটন/লেবেলের টেক্সট বদলাতে চাইলে লিখুন। ফাঁকা রাখলে ডিফল্ট (গ্রে করে দেখানো) ব্যবহার হবে।',
			'fields' => $string_fields,
		);

		self::$schema = $s;
		return $s;
	}

	/* ------------------------------------------------------------------ */
	/* Defaults & getters                                                  */
	/* ------------------------------------------------------------------ */

	private static function default_for( $def ) {
		if ( array_key_exists( 'default', $def ) ) {
			return $def['default'];
		}
		switch ( $def['type'] ) {
			case 'bi':
			case 'bi_textarea':
				return array( 'bn' => '', 'en' => '' );
			case 'repeater':
			case 'lines':
				return array();
			case 'checkbox':
			case 'number':
			case 'image':
				return 0;
			default:
				return '';
		}
	}

	/** সেভ করা মান + ডিফল্ট মিলিয়ে সব সেটিংস */
	public static function all() {
		$saved  = get_option( self::OPTION, array() );
		$saved  = is_array( $saved ) ? $saved : array();
		$result = array();
		foreach ( self::schema() as $tab => $tdef ) {
			foreach ( $tdef['fields'] as $key => $def ) {
				if ( isset( $saved[ $tab ] ) && is_array( $saved[ $tab ] ) && array_key_exists( $key, $saved[ $tab ] ) ) {
					$val = $saved[ $tab ][ $key ];
					// ডিফল্ট দ্বিভাষিক মান ফাঁকা হলে ডিফল্ট ফিরিয়ে দিই না — ব্যবহারকারী ইচ্ছা করে ফাঁকা রাখতে পারেন।
					$result[ $tab ][ $key ] = $val;
				} else {
					$result[ $tab ][ $key ] = self::default_for( $def );
				}
			}
		}
		return $result;
	}

	public static function get( $tab, $key, $fallback = null ) {
		static $cache = null;
		if ( null === $cache ) {
			$cache = self::all();
		}
		return isset( $cache[ $tab ][ $key ] ) ? $cache[ $tab ][ $key ] : $fallback;
	}

	public static function is_dhaka_zone( $district_value ) {
		$row = self::find_district( $district_value );
		return $row && 'inside' === $row['zone'];
	}

	/**
	 * জেলা খুঁজুন: "Dhaka", "ঢাকা", "ঢাকা (Dhaka)" যেকোনো ফরম্যাটে।
	 */
	public static function find_district( $value ) {
		$value = trim( (string) $value );
		if ( '' === $value ) {
			return null;
		}
		$rows = self::all()['checkout']['districts'];
		foreach ( (array) $rows as $row ) {
			$label = $row['name_bn'] . ' (' . $row['name_en'] . ')';
			if ( 0 === strcasecmp( $value, $label ) || 0 === strcasecmp( $value, $row['name_en'] ) || $value === $row['name_bn'] ) {
				$row['label'] = $label;
				return $row;
			}
		}
		return null;
	}

	/* ------------------------------------------------------------------ */
	/* Sanitization                                                        */
	/* ------------------------------------------------------------------ */

	public static function sanitize_value( $def, $val ) {
		switch ( $def['type'] ) {
			case 'bi':
				$val = is_array( $val ) ? $val : array();
				return array(
					'bn' => isset( $val['bn'] ) ? sanitize_text_field( gd_str_input( $val['bn'] ) ) : '',
					'en' => isset( $val['en'] ) ? sanitize_text_field( gd_str_input( $val['en'] ) ) : '',
				);
			case 'bi_textarea':
				$val = is_array( $val ) ? $val : array();
				return array(
					'bn' => isset( $val['bn'] ) ? sanitize_textarea_field( gd_str_input( $val['bn'] ) ) : '',
					'en' => isset( $val['en'] ) ? sanitize_textarea_field( gd_str_input( $val['en'] ) ) : '',
				);
			case 'textarea':
				return sanitize_textarea_field( (string) $val );
			case 'url':
				return esc_url_raw( trim( (string) $val ) );
			case 'number':
				return is_numeric( $val ) ? $val + 0 : 0;
			case 'checkbox':
				return empty( $val ) ? 0 : 1;
			case 'image':
				return absint( $val );
			case 'color':
				$c = sanitize_hex_color( (string) $val );
				return $c ? $c : '';
			case 'select':
				$val = sanitize_text_field( (string) $val );
				return isset( $def['options'][ $val ] ) ? $val : ( isset( $def['default'] ) ? $def['default'] : '' );
			case 'category':
				return sanitize_title( (string) $val );
			case 'lines':
				if ( is_array( $val ) ) {
					$lines = $val;
				} else {
					$lines = preg_split( '/\r\n|\r|\n/', (string) $val );
				}
				$out = array();
				foreach ( (array) $lines as $line ) {
					$line = sanitize_text_field( $line );
					if ( '' !== $line ) {
						$out[] = $line;
					}
				}
				return $out;
			case 'repeater':
				$rows = array();
				if ( ! is_array( $val ) ) {
					return $rows;
				}
				foreach ( $val as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$clean = array();
					foreach ( $def['fields'] as $k => $sub ) {
						$clean[ $k ] = self::sanitize_value( $sub, isset( $row[ $k ] ) ? $row[ $k ] : self::default_for( $sub ) );
					}
					$rows[] = $clean;
				}
				return $rows;
			case 'password':
			case 'text':
			default:
				return sanitize_text_field( (string) $val );
		}
	}

	/**
	 * Settings API sanitize callback — শুধু যেসব ট্যাব পোস্ট হয়েছে সেগুলোই আপডেট হয়।
	 */
	public static function sanitize_option( $input ) {
		if ( ! current_user_can( 'manage_options' ) && ! ( defined( 'WP_CLI' ) && WP_CLI ) ) {
			return get_option( self::OPTION, array() );
		}
		$existing = get_option( self::OPTION, array() );
		$existing = is_array( $existing ) ? $existing : array();
		$input    = is_array( $input ) ? $input : array();
		foreach ( self::schema() as $tab => $tdef ) {
			if ( ! isset( $input[ $tab ] ) || ! is_array( $input[ $tab ] ) ) {
				continue;
			}
			$clean = array();
			foreach ( $tdef['fields'] as $key => $def ) {
				$raw = array_key_exists( $key, $input[ $tab ] ) ? $input[ $tab ][ $key ] : self::default_for_missing( $def );
				if ( 'strings' === $tab ) {
					$v = self::sanitize_value( $def, $raw );
					if ( '' !== $v['bn'] || '' !== $v['en'] ) {
						$clean[ $key ] = $v;
					}
					continue;
				}
				$clean[ $key ] = self::sanitize_value( $def, $raw );
			}
			$existing[ $tab ] = $clean;
		}
		return $existing;
	}

	/** চেকবক্স/রিপিটার না এলে খালি ধরা হয়। */
	private static function default_for_missing( $def ) {
		if ( 'checkbox' === $def['type'] ) {
			return 0;
		}
		if ( 'repeater' === $def['type'] || 'lines' === $def['type'] ) {
			return array();
		}
		return self::default_for( $def );
	}

	/* ------------------------------------------------------------------ */
	/* Public formatting                                                   */
	/* ------------------------------------------------------------------ */

	public static function format_value( $def, $val ) {
		switch ( $def['type'] ) {
			case 'image':
				$id = absint( $val );
				if ( ! $id ) {
					return '';
				}
				$url = wp_get_attachment_url( $id );
				return $url ? $url : '';
			case 'checkbox':
				return ! empty( $val );
			case 'number':
				return is_numeric( $val ) ? $val + 0 : 0;
			case 'lines':
				return array_values( (array) $val );
			case 'bi':
			case 'bi_textarea':
				$val = is_array( $val ) ? $val : array();
				return array(
					'bn' => isset( $val['bn'] ) ? (string) $val['bn'] : '',
					'en' => isset( $val['en'] ) ? (string) $val['en'] : '',
				);
			case 'repeater':
				$out = array();
				foreach ( (array) $val as $row ) {
					$r = array();
					foreach ( $def['fields'] as $k => $sub ) {
						$r[ $k ] = self::format_value( $sub, isset( $row[ $k ] ) ? $row[ $k ] : self::default_for( $sub ) );
					}
					$out[] = $r;
				}
				return $out;
			default:
				return (string) $val;
		}
	}

	/** পাবলিক REST-এ যাওয়া সেটিংস (private ফিল্ড বাদে)। */
	public static function public_settings() {
		$cached = get_transient( 'gd_public_settings' );
		if ( is_array( $cached ) ) {
			return $cached;
		}
		$all = self::all();
		$out = array();
		foreach ( self::schema() as $tab => $tdef ) {
			if ( 'strings' === $tab ) {
				$strings = array();
				foreach ( $all['strings'] as $k => $v ) {
					if ( is_array( $v ) && ( ! empty( $v['bn'] ) || ! empty( $v['en'] ) ) ) {
						$strings[ $k ] = array(
							'bn' => (string) $v['bn'],
							'en' => (string) $v['en'],
						);
					}
				}
				$out['strings'] = (object) $strings;
				continue;
			}
			if ( 'integrations' === $tab ) {
				continue;
			}
			foreach ( $tdef['fields'] as $key => $def ) {
				if ( ! empty( $def['private'] ) ) {
					continue;
				}
				$out[ $tab ][ $key ] = self::format_value( $def, $all[ $tab ][ $key ] );
			}
		}
		$out['meta'] = array(
			'currency'   => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'BDT',
			'wp_url'     => home_url( '/' ),
			'updated_at' => gmdate( 'c' ),
			'version'    => GD_VERSION,
		);
		set_transient( 'gd_public_settings', $out, 10 * MINUTE_IN_SECONDS );
		return $out;
	}
}

/** wp_unslash শুধু POST ইনপুটে দরকার; Settings API ইতিমধ্যে unslash করে — তাই নো-অপ। */
function gd_str_input( $v ) {
	return is_string( $v ) ? $v : '';
}
