import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>this directory exists to confirm that files with test/spec/stories in the filename are ignored</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}