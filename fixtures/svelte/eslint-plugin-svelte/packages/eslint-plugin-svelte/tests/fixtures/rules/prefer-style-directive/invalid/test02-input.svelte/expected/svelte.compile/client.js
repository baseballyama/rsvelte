import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Test02_input($$anchor) {
	var div = root();

	$.set_style(div, `color: ${red ?? ''}; width: 12px`);
	$.append($$anchor, div);
}