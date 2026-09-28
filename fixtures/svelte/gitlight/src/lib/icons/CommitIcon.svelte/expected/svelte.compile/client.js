import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="3.25" stroke="#64B75D" stroke-width="1.5"></circle><path d="M6 10H2m16 0h-4" stroke="#64B75D" stroke-width="1.5" stroke-linecap="round"></path></svg>`);

export default function CommitIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}