import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div> <div></div> <img/></div>`);

export default function Normal_any_output($$anchor) {
	var div = root();

	$.append($$anchor, div);
}