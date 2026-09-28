import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import cjs from 'e2e-test-dep-page-svelte';

var root = $.from_html(`<p>this page uses a new dependency</p>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// @ts-ignore
	cjs.cjs();

	var p = root();

	$.append($$anchor, p);
	$.pop();
}