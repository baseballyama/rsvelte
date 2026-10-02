import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

var root = $.from_html(`<a href="/fork/1">Navigate to /1</a> <button>Go to /fork?key=value</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);

	$.delegated('click', button, () => {
		goto('/fork?key=value', { replace: true });
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);