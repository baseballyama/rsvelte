import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><img/></div>`);

export default function Void_never_output($$anchor) {
	var div = root();

	$.append($$anchor, div);
}