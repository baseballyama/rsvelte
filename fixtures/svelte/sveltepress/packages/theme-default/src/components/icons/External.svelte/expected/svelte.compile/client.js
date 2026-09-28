import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path strokeDasharray="36" strokeDashoffset="36" d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="36;0"></animate></path><path strokeDasharray="12" strokeDashoffset="12" d="M13 11L20 4"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.3s" values="12;0"></animate></path><path strokeDasharray="8" strokeDashoffset="8" d="M21 3H15M21 3V9"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="8;0"></animate></path></g></svg>`);

export default function External($$anchor, $$props) {
	/** @type {{ [key: string]: any }} */
	const rest = $.rest_props($$props, rest_excludes);

	var svg = root();

	$.attribute_effect(svg, () => ({ ...rest, width: '1em', height: '1em', viewBox: '0 0 24 24' }));
	$.append($$anchor, svg);
}