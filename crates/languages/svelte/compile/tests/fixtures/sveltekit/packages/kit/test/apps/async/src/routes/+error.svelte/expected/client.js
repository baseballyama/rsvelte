import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1 class="svelte-1ujoa4n"> </h1> <p id="message" class="svelte-1ujoa4n">This is your custom error page saying: "<b> </b>"</p> <a id="error-home" href="/">home</a>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	$.head('1ujoa4n', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Custom error page: ${$$props.error.message ?? ''}`;
		});
	});

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var b = $.sibling($.child(p));
	var text_1 = $.only_child(b, true);

	$.next();
	$.reset(p);
	$.next(2);

	$.template_effect(() => {
		$.set_text(text, page.status);
		$.set_text(text_1, $$props.error.message);
	});

	$.append($$anchor, fragment);
	$.pop();
}