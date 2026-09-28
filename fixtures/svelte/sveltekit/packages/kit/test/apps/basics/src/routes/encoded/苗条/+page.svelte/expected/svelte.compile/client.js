import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1>static</h1> <h2> </h2> <h3> </h3>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var /** @type {{ data: import('./$types').PageData }} */
	h2 = $.sibling($.first_child(fragment), 2);

	var text = $.only_child(h2, true);
	var h3 = $.sibling(h2, 2);
	var text_1 = $.only_child(h3, true);

	$.template_effect(() => {
		$.set_text(text, $$props.data.path);
		$.set_text(text_1, page.url.pathname);
	});

	$.append($$anchor, fragment);
	$.pop();
}