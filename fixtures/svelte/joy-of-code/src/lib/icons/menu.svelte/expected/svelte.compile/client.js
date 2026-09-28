import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>`);

export default function Menu($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		xmlns: 'http://www.w3.org/2000/svg',
		viewBox: '0 0 24 24',
		stroke: 'currentColor',
		fill: 'none',
		...rest
	}));

	$.append($$anchor, svg);
}