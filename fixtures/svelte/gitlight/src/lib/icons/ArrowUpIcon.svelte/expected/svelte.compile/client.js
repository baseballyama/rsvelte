import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="m16 9-6-6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);

export default function ArrowUpIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}