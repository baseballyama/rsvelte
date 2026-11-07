import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="#missing-id">Bad link</a> <a href="#top">Bad link</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}