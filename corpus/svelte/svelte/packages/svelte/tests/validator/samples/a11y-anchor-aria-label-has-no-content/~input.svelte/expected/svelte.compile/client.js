import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/foo" aria-label="baz"></a>`);

export default function Input($$anchor) {
	var a = root();

	$.append($$anchor, a);
}