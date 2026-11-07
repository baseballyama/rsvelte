import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { page } from '$app/state';

var root = $.from_html(`<h2> </h2> <a data-testid="child">/slash/child</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h2 = $.first_child(fragment);
	var text = $.only_child(h2, true);
	var a = $.sibling(h2, 2);

	$.template_effect(
		($0) => {
			$.set_text(text, page.url.pathname);
			$.set_attribute(a, 'href', $0);
		},
		[() => resolve('/slash/child')]
	);

	$.append($$anchor, fragment);
	$.pop();
}