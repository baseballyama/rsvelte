import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7H5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 10a6 6 0 1 0 6-6C7.913 4 6.075 5.383 5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>`);

export default function RestoreIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}