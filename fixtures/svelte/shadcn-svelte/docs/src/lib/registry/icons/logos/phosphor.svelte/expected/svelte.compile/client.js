import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path fill="none" d="M0 0h32v32H0z"></path><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h9v16H9zm9 16v9a9 9 0 0 1-9-9M9 5l9 16m0 0h1a8 8 0 0 0 0-16h-1"></path></svg>`);

export default function Phosphor($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		xmlns: 'http://www.w3.org/2000/svg',
		viewBox: '0 0 32 32',
		width: '32',
		height: '32',
		role: 'img',
		color: 'currentColor',
		...restProps
	}));

	$.append($$anchor, svg);
}