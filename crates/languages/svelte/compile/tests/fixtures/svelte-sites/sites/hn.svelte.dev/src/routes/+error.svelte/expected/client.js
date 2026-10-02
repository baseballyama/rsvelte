import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1 class="svelte-1oilzc3"> </h1> <pre> </pre>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
	const title = offline ? 'Offline' : page.status;

	const message = offline
		? 'Find the internet and try again'
		: page.error?.message;

	var fragment = root();

	$.head('1oilzc3', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = title ?? '';
		});
	});

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var pre = $.sibling(h1, 2);
	var text_1 = $.only_child(pre, true);

	$.template_effect(() => {
		$.set_text(text, title);
		$.set_text(text_1, message);
	});

	$.append($$anchor, fragment);
	$.pop();
}