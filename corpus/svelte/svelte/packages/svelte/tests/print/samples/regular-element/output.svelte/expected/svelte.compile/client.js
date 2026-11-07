import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><a href="/foo">bar</a></div> <br/>`, 1);

export default function Output($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}