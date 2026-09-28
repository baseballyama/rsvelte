import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/load/unchanged-parent/uses-parent/a">uses parent</a> <a href="/load/unchanged-parent/isolated/a">isolated</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}