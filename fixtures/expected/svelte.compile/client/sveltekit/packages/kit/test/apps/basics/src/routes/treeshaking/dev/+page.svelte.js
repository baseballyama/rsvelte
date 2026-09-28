import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dev } from '$app/env';

var root = $.from_html(`<p> </p> <p> </p>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(() => {
		$.set_text(text, dev ? 'not prod' : 'prod');
		$.set_text(text_1, `negated: ${!dev ? 'prod' : 'not prod'}`);
	});

	$.append($$anchor, fragment);
}