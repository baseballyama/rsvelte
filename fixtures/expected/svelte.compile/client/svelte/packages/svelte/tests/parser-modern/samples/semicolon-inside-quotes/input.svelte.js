import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1xl4k3p">Semicolon inside quotes</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}