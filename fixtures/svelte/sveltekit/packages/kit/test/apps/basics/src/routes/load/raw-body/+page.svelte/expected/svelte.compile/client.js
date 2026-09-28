import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/load/raw-body/dataview">DataView</a> <a href="/load/raw-body/string">String</a> <a href="/load/raw-body/uint8array">Uint8Array</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}