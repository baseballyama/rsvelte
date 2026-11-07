import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div></div>`);

export default function Component_never_output($$anchor) {
	var div = root();

	$.append($$anchor, div);
}