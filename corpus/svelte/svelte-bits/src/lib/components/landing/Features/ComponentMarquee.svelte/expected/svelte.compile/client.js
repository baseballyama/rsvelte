import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="ln-feat-pill"> </a>`);
var root_1 = $.from_html(`<div class="ln-feat-marquee"><div class="ln-feat-marquee-track"><div class="ln-feat-marquee-scroll"></div></div> <div class="ln-feat-marquee-track"><div class="ln-feat-marquee-scroll ln-feat-marquee-scroll--rev"></div></div></div>`);

export default function ComponentMarquee($$anchor, $$props) {
	$.push($$props, true);

	const toSlug = (s) => s.toLowerCase().replace(/\s+/g, '-');

	const ROW_A = [
		{ name: 'Dot Field', cat: 'backgrounds' },
		{ name: 'Line Waves', cat: 'backgrounds' },
		{ name: 'Blob Cursor', cat: 'animations' },
		{ name: 'Soft Aurora', cat: 'backgrounds' },
		{ name: 'Magnet Lines', cat: 'animations' },
		{ name: 'Antigravity', cat: 'animations' },
		{ name: 'Ballpit', cat: 'backgrounds' },
		{ name: 'Pixel Trail', cat: 'animations' },
		{ name: 'Magic Rings', cat: 'animations' }
	];

	const ROW_B = [
		{ name: 'Radar', cat: 'backgrounds' },
		{ name: 'Shape Grid', cat: 'backgrounds' },
		{ name: 'Ribbons', cat: 'animations' },
		{ name: 'Grainient', cat: 'backgrounds' },
		{ name: 'Orbit Images', cat: 'animations' },
		{ name: 'Metallic Paint', cat: 'animations' },
		{ name: 'Balatro', cat: 'backgrounds' },
		{ name: 'Aurora', cat: 'backgrounds' },
		{ name: 'Splash Cursor', cat: 'animations' },
		{ name: 'Beams', cat: 'backgrounds' }
	];

	// Note: components don't exist yet, so links go to /get-started/introduction
	const HREF = '/get-started/introduction';

	const rowADoubled = [...ROW_A, ...ROW_A];
	const rowBDoubled = [...ROW_B, ...ROW_B];
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => rowADoubled, $.index, ($$anchor, c) => {
		var a = root();

		$.set_attribute(a, 'href', HREF);

		var text = $.only_child(a, true);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'data-slug', $0);
				$.set_attribute(a, 'data-cat', $.get(c).cat);
				$.set_text(text, $.get(c).name);
			},
			[() => toSlug($.get(c).name)]
		);

		$.append($$anchor, a);
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);

	$.each(div_4, 21, () => rowBDoubled, $.index, ($$anchor, c) => {
		var a_1 = root();

		$.set_attribute(a_1, 'href', HREF);

		var text_1 = $.only_child(a_1, true);

		$.template_effect(
			($0) => {
				$.set_attribute(a_1, 'data-slug', $0);
				$.set_attribute(a_1, 'data-cat', $.get(c).cat);
				$.set_text(text_1, $.get(c).name);
			},
			[() => toSlug($.get(c).name)]
		);

		$.append($$anchor, a_1);
	});

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}