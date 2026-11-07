import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div>`);

export default function Component($$anchor) {
	var div = root();

	$.append($$anchor, div);
}