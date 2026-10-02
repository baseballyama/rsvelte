import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello <strong>bold</strong> world</p>`);

export default function Input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}