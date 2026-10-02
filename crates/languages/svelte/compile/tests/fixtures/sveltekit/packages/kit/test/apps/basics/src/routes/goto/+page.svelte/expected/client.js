import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

var root = $.from_html(`<button>goto</button> <p> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let message = '...';
	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, message));

	$.delegated('click', button, async () => {
		try {
			await goto('https://example.com');
		} catch(e) {
			message = e instanceof Error ? e.message : 'unknown error message';
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);