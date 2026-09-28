import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';

var root = $.from_html(`<h1> </h1> <a href="/navigation-lifecycle/after-navigate/a">/a</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import('$app/navigation').AfterNavigate['from'] | null} */
	let from;

	/** @type {import('$app/navigation').AfterNavigate['to']} */
	let to;

	afterNavigate((navigation) => {
		from = navigation.from;
		to = navigation.to;
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);

	$.next(2);
	$.template_effect(() => $.set_text(text, `${from?.url.pathname ?? ''} -> ${to?.url.pathname ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}