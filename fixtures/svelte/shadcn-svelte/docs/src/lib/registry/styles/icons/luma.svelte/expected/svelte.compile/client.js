import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path d="M2 12C2 8.134 5.134 5 9 5H15C18.866 5 22 8.134 22 12C22 15.866 18.866 19 15 19H9C5.134 19 2 15.866 2 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`);

export default function Luma($$anchor, $$props) {
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