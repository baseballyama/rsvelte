import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h2> </h2>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var h2 = root();
	var text = $.only_child(h2, true);

	$.template_effect(() => $.set_text(text, page.url.pathname));
	$.append($$anchor, h2);
	$.pop();
}