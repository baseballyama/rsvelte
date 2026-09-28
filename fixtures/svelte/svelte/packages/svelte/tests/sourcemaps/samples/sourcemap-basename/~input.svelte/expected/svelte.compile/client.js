import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>Hello world</span>`);

export default function Input($$anchor) {
	var span = root();

	$.append($$anchor, span);
}