import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preloadData } from '$app/navigation';

var root = $.from_html(`<button type="button">404</button> <button type="button">500</button> <p> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {any} */
	let data;

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${`${data?.type}`} ${`${data?.status}`} ${`${data?.error?.message}`}`));

	$.delegated('click', button, async () => {
		data = await preloadData('/routing/preloading/error/404');
	});

	$.delegated('click', button_1, async () => {
		data = await preloadData('/routing/preloading/error/500');
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);