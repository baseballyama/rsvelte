import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var /** @type {import('./$types').PageProps} */
	h1 = root();

	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, $$props.data.body));
	$.append($$anchor, h1);
	$.pop();
}