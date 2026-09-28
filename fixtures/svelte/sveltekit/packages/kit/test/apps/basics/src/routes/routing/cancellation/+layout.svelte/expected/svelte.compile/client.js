import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <a href="/routing/cancellation/a">a</a> <a href="/routing/cancellation/b">b</a>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.next(4);
	$.append($$anchor, fragment);
}