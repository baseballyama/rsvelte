import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { untrack } from 'svelte';

var root = $.from_html(`<p> </p> <a href="/state/data/state-update/a">a</a> <a href="/state/data/state-update/b">b</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let previous = page.data;
	let count = $.state(0);

	$.user_effect(() => {
		if (previous !== page.data) {
			untrack(() => $.update(count));
		}
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 6);

	$.snippet(node, () => $$props.children);
	$.template_effect(() => $.set_text(text, `page.data was updated ${$.get(count) ?? ''} time(s)`));
	$.append($$anchor, fragment);
	$.pop();
}