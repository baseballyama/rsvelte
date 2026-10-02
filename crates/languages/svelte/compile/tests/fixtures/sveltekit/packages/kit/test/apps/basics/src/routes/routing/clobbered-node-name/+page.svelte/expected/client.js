import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form><input id="nodeName"/></form>`);

export default function _page($$anchor) {
	var form = root();

	$.append($$anchor, form);
}