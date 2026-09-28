import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto, preloadCode, preloadData } from '$app/navigation';

var root = $.from_html(`<!> <footer>Custom layout</footer>`, 1);

export default function _layout($$anchor, $$props) {
	if (typeof window !== 'undefined') {
		Object.assign(window, { goto, preloadCode, preloadData });
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.next(2);
	$.append($$anchor, fragment);
}