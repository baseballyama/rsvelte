import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p data-foo="barbaz">this is unstyled</p> <p data-foo="bazbar" class="svelte-1m6211k">this is styled</p></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}