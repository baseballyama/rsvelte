import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.586V4a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293L13.5 7.5l3.793 3.793a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-8-8A1 1 0 0 1 3 8.586Z" stroke="#64B75D" stroke-width="1.5"></path><circle cx="5.75" cy="5.75" r=".75" fill="#64B75D"></circle></svg>`);

export default function ReleaseIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}