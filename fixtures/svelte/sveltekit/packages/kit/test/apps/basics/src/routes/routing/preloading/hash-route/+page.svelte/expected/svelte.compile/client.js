import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <p> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {Record<string, { title: string }>} */
	const modal_contents = {
		'please-dont-show-me': { title: 'Oopsie' },
		'please-dont-show-me-jr': { title: 'Oopsie Jr.' }
	};

	/** @type {{ title: string } | undefined} */
	let modal = $.state(undefined);

	const show_modal = () => {
		const hash = page.url.hash.substring(1);

		$.set(modal, modal_contents[hash], true);
	};

	onMount(show_modal);

	var fragment = root();

	$.event('popstate', $.window, show_modal);

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		$.set_text(text, $.get(modal)?.title ?? '');
		$.set_text(text_1, `Loaded ${$$props.data.calls ?? ''} times.`);
	});

	$.append($$anchor, fragment);
	$.pop();
}