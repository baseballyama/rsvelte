import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://www.google.com">Google</a>`);

export default function Input($$anchor) {
	var a = root();

	$.append($$anchor, a);
}