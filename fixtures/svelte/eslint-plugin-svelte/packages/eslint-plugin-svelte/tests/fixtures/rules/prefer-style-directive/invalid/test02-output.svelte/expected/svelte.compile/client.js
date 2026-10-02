import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Test02_output($$anchor) {
	var div = root();

	$.set_style(div, 'width: 12px', {}, { color: red });
	$.append($$anchor, div);
}