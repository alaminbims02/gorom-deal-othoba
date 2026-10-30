/* Gorom Headless admin UI */
(function ($) {
	'use strict';

	function initColor(ctx) {
		$(ctx).find('.gd-color').each(function () {
			if (!$(this).closest('.wp-picker-container').length) {
				$(this).wpColorPicker();
			}
		});
	}

	function reindex($repeater) {
		var name = $repeater.data('name');
		$repeater.children('.gd-rows').children('.gd-row').each(function (i) {
			$(this).find('[name]').each(function () {
				var n = $(this).attr('name');
				if (!n || n.indexOf(name + '[') !== 0) { return; }
				var rest = n.substring(name.length);
				rest = rest.replace(/^\[[^\]]*\]/, '[' + i + ']');
				$(this).attr('name', name + rest);
			});
		});
	}

	function updateTitle($row) {
		var $first = $row.find('.gd-row-body input[type=text], .gd-row-body select').filter(':visible, :hidden').first();
		// ট্যাইটেল: প্রথম টেক্সট ফিল্ড যার মান আছে।
		var title = '';
		$row.find('.gd-row-body input[type=text]').each(function () {
			if (!$(this).closest('.gd-color, .wp-picker-container').length && $(this).val()) {
				title = $(this).val();
				return false;
			}
		});
		$row.find('.gd-row-title').text(title.length > 60 ? title.substring(0, 60) + '…' : title);
	}

	$(function () {
		initColor(document);

		$(document).on('click', '.gd-row-add', function () {
			var $rep = $(this).closest('.gd-repeater');
			var tpl = $rep.find('> .gd-row-template').html();
			var idx = $rep.children('.gd-rows').children('.gd-row').length;
			var $row = $(tpl.replace(/__INDEX__/g, idx));
			$row.addClass('open');
			$rep.children('.gd-rows').append($row);
			initColor($row);
		});

		$(document).on('click', '.gd-row-del', function () {
			var $rep = $(this).closest('.gd-repeater');
			if (window.confirm('মুছে ফেলবেন?')) {
				$(this).closest('.gd-row').remove();
				reindex($rep);
			}
		});

		$(document).on('click', '.gd-row-up', function () {
			var $row = $(this).closest('.gd-row');
			var $prev = $row.prev('.gd-row');
			if ($prev.length) { $row.insertBefore($prev); reindex($row.closest('.gd-repeater')); }
		});

		$(document).on('click', '.gd-row-down', function () {
			var $row = $(this).closest('.gd-row');
			var $next = $row.next('.gd-row');
			if ($next.length) { $row.insertAfter($next); reindex($row.closest('.gd-repeater')); }
		});

		$(document).on('click', '.gd-row-toggle, .gd-row-title', function () {
			$(this).closest('.gd-row').toggleClass('open');
		});

		$(document).on('input change', '.gd-row-body input', function () {
			updateTitle($(this).closest('.gd-row'));
		});

		// মিডিয়া পিকার
		$(document).on('click', '.gd-image-pick', function (e) {
			e.preventDefault();
			var $box = $(this).closest('.gd-image');
			var frame = wp.media({ title: 'ছবি নির্বাচন', button: { text: 'ব্যবহার করুন' }, multiple: false, library: { type: 'image' } });
			frame.on('select', function () {
				var att = frame.state().get('selection').first().toJSON();
				$box.find('.gd-image-id').val(att.id);
				var src = (att.sizes && att.sizes.thumbnail) ? att.sizes.thumbnail.url : att.url;
				$box.find('.gd-image-preview').html($('<img/>').attr('src', src));
			});
			frame.open();
		});

		$(document).on('click', '.gd-image-clear', function () {
			var $box = $(this).closest('.gd-image');
			$box.find('.gd-image-id').val('0');
			$box.find('.gd-image-preview').empty();
		});
	});
})(jQuery);
