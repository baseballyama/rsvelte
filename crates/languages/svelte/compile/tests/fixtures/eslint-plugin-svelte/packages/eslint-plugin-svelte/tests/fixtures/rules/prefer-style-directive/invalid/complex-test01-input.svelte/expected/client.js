import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Complex_test01_input($$anchor) {
	var div = root();

	$.set_style(div, `color: ${r ?? ''}e${d ?? ''}`);
	$.append($$anchor, div);
}