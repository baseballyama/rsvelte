import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-4oyy5b">test</p>`);

export default function Widget($$anchor) {
	var p = root();

	$.append($$anchor, p);
}