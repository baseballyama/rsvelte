import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="text-4xl font-bold drop-shadow-sm">🪄 Use arrow keys to navigate</p>`);

export default function Slide($$anchor) {
	var p = root();

	$.append($$anchor, p);
}