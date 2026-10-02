import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p data-foo="bar" class="svelte-1gx874g">this is styled</p> <p data-foo="baz">this is unstyled</p></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}