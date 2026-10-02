import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>This will be matched</div>`);

export default function _page($$anchor) {
	var div = root();

	$.append($$anchor, div);
}