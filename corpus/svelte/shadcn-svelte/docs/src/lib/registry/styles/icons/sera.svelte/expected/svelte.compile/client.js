import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2"></rect></svg>`);

export default function Sera($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		xmlns: 'http://www.w3.org/2000/svg',
		width: '128',
		height: '128',
		viewBox: '0 0 24 24',
		fill: 'none',
		role: 'img',
		color: 'currentColor',
		...restProps
	}));

	$.append($$anchor, svg);
}