import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1 class="svelte-1baasea"> </h1> <p id="message" class="svelte-1baasea">This is your custom error page saying: "<b> </b>"</p>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	$.head('1baasea', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Custom error page: ${page.error?.message ?? ''}`;
		});
	});

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var b = $.sibling($.child(p));
	var text_1 = $.only_child(b, true);

	$.next();
	$.reset(p);

	$.template_effect(() => {
		$.set_text(text, page.status);
		$.set_text(text_1, page.error?.message);
	});

	$.append($$anchor, fragment);
	$.pop();
}