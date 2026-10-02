import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/remote/query-redirect/from-page">from page</a> <a href="/remote/query-redirect/from-common-layout">from layout</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var a = $.first_child(fragment);

	$.set_attribute(a, 'data-sveltekit-preload-data', false);

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'data-sveltekit-preload-data', false);
	$.append($$anchor, fragment);
}