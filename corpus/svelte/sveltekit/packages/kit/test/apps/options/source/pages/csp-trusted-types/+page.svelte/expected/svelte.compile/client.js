import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>this page will error when Svelte tries to set the innerHTML without a trusted type</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}