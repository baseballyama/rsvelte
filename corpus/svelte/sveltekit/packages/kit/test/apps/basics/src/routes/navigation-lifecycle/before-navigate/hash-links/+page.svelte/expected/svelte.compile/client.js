import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { beforeNavigate } from '$app/navigation';

var root = $.from_html(`<h1> </h1> <a href="#x">x</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let before_navigate_ran = false;

	beforeNavigate(() => {
		before_navigate_ran = true;
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);

	$.next(2);
	$.template_effect(() => $.set_text(text, `before_navigate_ran: ${before_navigate_ran ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}