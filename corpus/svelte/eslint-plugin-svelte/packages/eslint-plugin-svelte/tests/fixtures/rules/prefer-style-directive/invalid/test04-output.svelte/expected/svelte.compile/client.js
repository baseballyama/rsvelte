import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>foo</div>`);

export default function Test04_output($$anchor) {
	var div = root();

	$.set_style(div, 'position:relative;', {}, { display: 'block' });
	$.append($$anchor, div);
}