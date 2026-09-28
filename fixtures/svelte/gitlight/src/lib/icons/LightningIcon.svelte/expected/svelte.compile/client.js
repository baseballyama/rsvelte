import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 9V3l-6 8h4v6l6-8h-4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path></svg>`);

export default function LightningIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}