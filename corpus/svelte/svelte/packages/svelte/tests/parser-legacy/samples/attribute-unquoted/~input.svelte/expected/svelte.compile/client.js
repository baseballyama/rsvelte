import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo"></div> <a href="/">home</a> <a href="/foo">home</a>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}