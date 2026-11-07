import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<button>Delete cookies and reload the page</button> <p> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {string} */
	let cookies;

	onMount(() => {
		cookies = document.cookie.split('; ').filter((c) => c.startsWith('one=') || c.startsWith('two=') || c.startsWith('three=')).sort().join('; ');
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, cookies));

	$.delegated('click', button, () => {
		for (const name of ['one', 'two', 'three']) {
			document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
		}

		location.reload();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);