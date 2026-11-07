import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="15.5" r="1.5" fill="currentColor"></circle><circle cx="10" cy="10" r="1.5" fill="currentColor"></circle><circle cx="10" cy="4.5" r="1.5" fill="currentColor"></circle></svg>`);

export default function ThreeDotsIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}