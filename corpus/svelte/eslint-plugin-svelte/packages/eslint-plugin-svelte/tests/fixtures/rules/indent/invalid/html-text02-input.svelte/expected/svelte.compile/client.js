import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>a <div></div>b
c</div>`);

export default function Html_text02_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}