import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <button>click</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let pathname = $.state(void 0);
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var button = $.sibling(h1, 2);

	$.template_effect(() => $.set_text(text, `${$.get(pathname)}`));

	$.delegated('click', button, () => {
		$.set(pathname, page.url.pathname, true);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);