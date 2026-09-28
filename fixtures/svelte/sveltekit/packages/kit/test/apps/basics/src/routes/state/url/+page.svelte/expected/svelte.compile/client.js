import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { goto } from '$app/navigation';

var root = $.from_html(`<button type="button">test</button> <p> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const q = $.derived(() => page.url.searchParams.get('q') || undefined);
	var fragment = root();
	var button = $.first_child(fragment);

	var // @ts-expect-error set is not in the types; we wanna test here that we guard against mutation in goto, too
	// @ts-expect-error
	p = $.sibling(button, 2);

	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, `${$.get(q)}`));

	$.delegated('click', button, () => {
		// @ts-expect-error set is not in the types; we wanna test here that we guard against mutation in goto, too
		page.url.searchParams.set('q', 'test');

		// @ts-expect-error
		goto(page.url);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);