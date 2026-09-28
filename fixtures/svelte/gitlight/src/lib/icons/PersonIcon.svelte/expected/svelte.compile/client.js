import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"></circle><path d="M15 16a5 5 0 0 0-10 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>`);

export default function PersonIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}