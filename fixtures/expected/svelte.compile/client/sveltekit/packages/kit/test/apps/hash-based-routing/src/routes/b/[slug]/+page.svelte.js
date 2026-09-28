import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<p data-data=""> </p> <p data-page=""> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `${$0 ?? ''}
	${$$props.data.route.id ?? ''}
	${$$props.data.url.pathname + $$props.data.url.search + $$props.data.url.hash}`);

			$.set_text(text_1, `${$1 ?? ''}
	${page.route.id ?? ''}
	${page.url.pathname + page.url.search + page.url.hash}`);
		},
		[
			() => JSON.stringify($$props.data.params),
			() => JSON.stringify(page.params)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}