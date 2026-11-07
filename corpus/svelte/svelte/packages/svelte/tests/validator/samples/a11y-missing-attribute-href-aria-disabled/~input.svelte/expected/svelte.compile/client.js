import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a role="link" aria-disabled="true">Back</a>`);

export default function Input($$anchor) {
	var a = root();

	$.append($$anchor, a);
}