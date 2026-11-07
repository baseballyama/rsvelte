import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <pre> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var pre = $.sibling(h1, 2);
	var text_1 = $.only_child(pre, true);

	$.template_effect(
		($0) => {
			$.set_text(text, `message: ${page.data.message ?? ''}`);
			$.set_text(text_1, $0);
		},
		[() => JSON.stringify(page.data)]
	);

	$.append($$anchor, fragment);
	$.pop();
}