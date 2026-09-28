import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pushState } from '$app/navigation';

var root = $.from_html(`<p> </p> <button>Increment</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	$.user_effect(() => {
		if ($.get(count)) pushState('', { count: $.get(count) });
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, `count: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);