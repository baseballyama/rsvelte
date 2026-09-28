import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe title="Child content" src="./child"></iframe>`);

export default function _page($$anchor) {
	var iframe = root();

	$.append($$anchor, iframe);
}