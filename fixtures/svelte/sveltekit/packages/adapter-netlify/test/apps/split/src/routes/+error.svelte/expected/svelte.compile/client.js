import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <p>Custom default error page</p>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);

	$.next(2);
	$.template_effect(() => $.set_text(text, `${page.status ?? ''}: ${page.error?.message ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}