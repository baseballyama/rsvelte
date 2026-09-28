import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import cjs from 'e2e-test-dep-error';

var root = $.from_html(`<!> <p>this error page uses a new dependency</p>`, 1);

export default function _error($$anchor, $$props) {
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