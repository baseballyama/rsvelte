import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p data-testid="fetch-url"> </p> <p data-testid="fetch-response"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var /** @type {import('./$types').PageProps} */
	p = $.first_child(fragment);

	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(() => {
		$.set_text(text, $$props.data.fetchUrl);
		$.set_text(text_1, $$props.data.fetchResponse);
	});

	$.append($$anchor, fragment);
	$.pop();
}