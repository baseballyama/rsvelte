import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form></form>`);

export default function Form($$anchor) {
	var form = root();

	$.append($$anchor, form);
}