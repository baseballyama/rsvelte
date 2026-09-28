import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg aria-label="Vercel Logo" fill="var(--highContrast)" height="26" viewBox="0 0 75 65"><path d="M37.59.25l36.95 64H.64l36.95-64z"></path></svg>`);

export default function Vercel($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}