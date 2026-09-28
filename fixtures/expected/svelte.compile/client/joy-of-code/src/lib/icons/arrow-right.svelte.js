import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path></svg>`);

export default function Arrow_right($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		xmlns: 'http://www.w3.org/2000/svg',
		viewBox: '0 0 24 24',
		'stroke-width': '1.5',
		stroke: 'currentColor',
		fill: 'none',
		...rest
	}));

	$.append($$anchor, svg);
}