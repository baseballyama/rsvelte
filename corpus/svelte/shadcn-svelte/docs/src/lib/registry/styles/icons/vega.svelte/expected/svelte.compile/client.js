import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width="2"></path></svg>`);

export default function Vega($$anchor, $$props) {
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