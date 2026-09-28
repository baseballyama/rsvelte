import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><path d="m7 9 4-4-4-4M1 9l4-4-4-4"></path></svg>`);

export default function DoubleArrowIcon($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		class: $$props.class || "ms-2 h-3 w-3 sm:ms-4 rtl:rotate-180",
		'aria-hidden': 'true',
		xmlns: 'http://www.w3.org/2000/svg',
		fill: 'none',
		viewBox: '0 0 12 10',
		stroke: 'currentColor',
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		'stroke-width': '2',
		...restProps
	}));

	$.append($$anchor, svg);
}