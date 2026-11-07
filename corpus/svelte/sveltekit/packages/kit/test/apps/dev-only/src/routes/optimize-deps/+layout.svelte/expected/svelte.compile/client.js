import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import cjs from 'e2e-test-dep-layout-svelte';

var root = $.from_html(`<!> <p>this layout uses a new dependency</p>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// @ts-ignore
	cjs.cjs();

	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}