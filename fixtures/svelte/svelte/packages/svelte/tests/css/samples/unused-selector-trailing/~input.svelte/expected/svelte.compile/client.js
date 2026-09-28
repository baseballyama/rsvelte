import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-jkyb40">hello</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}