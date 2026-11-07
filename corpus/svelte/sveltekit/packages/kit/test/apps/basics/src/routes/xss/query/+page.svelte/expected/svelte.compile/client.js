import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { to_pojo } from './utils.js';

var root = $.from_html(`<pre id="one"> </pre> <pre id="two"> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var /** @type {{ data: import('./$types').PageData }} */
	pre = $.first_child(fragment);

	var text = $.only_child(pre, true);
	var pre_1 = $.sibling(pre, 2);
	var text_1 = $.only_child(pre_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => JSON.stringify($$props.data.values),
			() => JSON.stringify(to_pojo(page.url.searchParams))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}