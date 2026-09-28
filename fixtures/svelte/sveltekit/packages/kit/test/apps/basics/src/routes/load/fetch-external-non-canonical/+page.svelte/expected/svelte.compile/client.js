import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';

var root = $.from_html(`<h1> </h1> <button>update</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import('./$types').PageProps} */
	async function update() {
		// no trailing slash, so it differs from the normalized cache key
		await fetch(`http://localhost:${$$props.data.port}`, { method: 'POST' });

		await invalidate(`http://localhost:${$$props.data.port}`);
	}

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var button = $.sibling(h1, 2);

	$.template_effect(() => $.set_text(text, `count: ${$$props.data.count ?? ''}`));
	$.delegated('click', button, update);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);