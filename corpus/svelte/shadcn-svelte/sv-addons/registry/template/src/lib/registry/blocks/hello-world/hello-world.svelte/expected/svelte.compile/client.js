import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="text-2xl font-bold">Hello world</h1>`);

export default function Hello_world($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}