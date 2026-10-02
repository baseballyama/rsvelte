import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea></textarea>`);

export default function Input($$anchor) {
	var textarea = root();

	textarea.readOnly = readonly;
	$.append($$anchor, textarea);
}