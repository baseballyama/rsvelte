import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path fill="currentColor" d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.671-10.227z"></path></svg>`);

export default function Stackblitz($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		viewBox: '0 0 28 28',
		'aria-hidden': 'true',
		height: '24',
		width: '24',
		...props
	}));

	$.append($$anchor, svg);
}