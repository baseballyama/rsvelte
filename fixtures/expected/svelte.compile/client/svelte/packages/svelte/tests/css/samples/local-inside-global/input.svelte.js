import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="foo svelte-7fd1nv">red/bold</p>`);

export default function Input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}