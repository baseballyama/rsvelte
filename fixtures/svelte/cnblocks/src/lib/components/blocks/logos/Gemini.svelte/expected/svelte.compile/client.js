import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><title></title><defs><linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%"><stop offset="0%" stop-color="#1C7DFF"></stop><stop offset="52.021%" stop-color="#1C69FF"></stop><stop offset="100%" stop-color="#F0DCD6"></stop></linearGradient></defs><path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#lobe-icons-gemini-fill)" fill-rule="nonzero"></path></svg>`);

export default function Gemini($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(svg, () => ({
		height: '1em',
		style: 'flex: none; line-height: 1;',
		viewBox: '0 0 24 24',
		xmlns: 'http://www.w3.org/2000/svg',
		width: '1em',
		...rest
	}));

	var title = $.child(svg);

	title.textContent = 'Gemini';
	$.next(2);
	$.reset(svg);
	$.append($$anchor, svg);
}