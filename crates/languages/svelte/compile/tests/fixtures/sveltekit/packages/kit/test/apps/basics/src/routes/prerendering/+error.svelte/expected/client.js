import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const title = $.derived(() => `${page.status}: ${page.error?.message}`);
	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, $.get(title)));
	$.append($$anchor, h1);
	$.pop();
}