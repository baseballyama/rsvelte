import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path d="M9 6l6 6l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);

export default function Next($$anchor, $$props) {
	/** @type {{ [key: string]: any }} */
	const rest = $.rest_props($$props, rest_excludes);

	var svg = root();

	$.attribute_effect(svg, () => ({ width: '1em', height: '1em', viewBox: '0 0 24 24', ...rest }));
	$.append($$anchor, svg);
}