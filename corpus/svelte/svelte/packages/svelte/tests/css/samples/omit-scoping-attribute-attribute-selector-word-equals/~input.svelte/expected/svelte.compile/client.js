import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p data-foo="qux bar" class="svelte-160l1nt">this is styled</p> <p data-foo="qux baz">this is unstyled</p></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}