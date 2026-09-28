import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p data-foo="barbaz" class="svelte-vqbvy5">this is styled</p> <p data-foo="bazbar">this is unstyled</p></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}