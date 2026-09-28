import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"></circle><path d="M10 11V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="10" cy="13.25" r=".75" fill="currentColor"></circle></svg>`);

export default function ExclamationMarkIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}