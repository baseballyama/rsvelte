import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea readonly=""></textarea>`);

export default function Input($$anchor) {
	var textarea = root();

	$.append($$anchor, textarea);
}