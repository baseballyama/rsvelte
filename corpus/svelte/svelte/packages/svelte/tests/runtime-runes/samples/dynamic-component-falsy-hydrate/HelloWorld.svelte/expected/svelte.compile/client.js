import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello world</div>`);

export default function HelloWorld($$anchor) {
	var div = root();

	$.append($$anchor, div);
}