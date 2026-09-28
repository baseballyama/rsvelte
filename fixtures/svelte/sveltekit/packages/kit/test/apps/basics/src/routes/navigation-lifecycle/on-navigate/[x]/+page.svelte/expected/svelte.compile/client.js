import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onNavigate } from '$app/navigation';

var root = $.from_html(`<h1> </h1> <a href="/navigation-lifecycle/on-navigate/b">/b</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import("$app/navigation").OnNavigate['from']} */
	let from;

	/** @type {import("$app/navigation").OnNavigate['to']} */
	let to;

	/** @type {Omit<import('$app/navigation').NavigationType, 'enter' | 'leave'>} */
	let type;

	let shallow = false;
	let called_return = false;

	onNavigate((navigation) => {
		from = navigation.from;
		to = navigation.to;
		type = navigation.type;
		shallow = navigation.shallow;
	});

	onNavigate(() => {
		return () => {
			called_return = true;
		};
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);

	$.next(2);
	$.template_effect(() => $.set_text(text, `${from?.url.pathname} -> ${to?.url.pathname} (${type ?? '...'}) ${shallow} ${called_return}`));
	$.append($$anchor, fragment);
	$.pop();
}