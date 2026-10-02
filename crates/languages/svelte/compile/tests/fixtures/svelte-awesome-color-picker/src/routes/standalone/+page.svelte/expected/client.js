import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ColorPicker, { A11yVariant } from '$lib';

var root = $.from_html(`<h1>color picker debug screen</h1> <div><!></div>`, 1);

export default function _page($$anchor) {
	let hex = $.state('#f6f0dc');
	let rgb = $.state(null);
	let hsv = $.state(null);
	var fragment = root();
	var h1 = $.first_child(fragment);

	$.set_style(h1, '', {}, { 'margin-bottom': '24px' });

	var div = $.sibling(h1, 2);

	$.set_style(div, '', {}, { margin: 'auto', width: 'fit-content' });

	var node = $.child(div);

	ColorPicker(node, {
		get components() {
			return A11yVariant;
		},
		nullable: true,
		isAlpha: true,
		isDialog: false,
		a11yLevel: 'AAA',
		a11yColors: [
			{ textHex: '#FFF', reverse: true, placeholder: 'background' },
			{
				textHex: '#FFF',
				bgHex: '#FF0000',
				reverse: true,
				placeholder: 'background /w alpha'
			},
			{ bgHex: '#FFF', placeholder: 'title', size: 'large' },
			{ bgHex: '#7F7F7F', placeholder: 'button' }
		],

		get hex() {
			return $.get(hex);
		},

		set hex($$value) {
			$.set(hex, $$value, true);
		},

		get rgb() {
			return $.get(rgb);
		},

		set rgb($$value) {
			$.set(rgb, $$value, true);
		},

		get hsv() {
			return $.get(hsv);
		},

		set hsv($$value) {
			$.set(hsv, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, fragment);
}