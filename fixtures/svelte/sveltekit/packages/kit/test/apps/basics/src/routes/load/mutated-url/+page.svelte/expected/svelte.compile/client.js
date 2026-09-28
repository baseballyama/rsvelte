import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <button>update q</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ data: import('./$types').PageData }} */
	function update_q() {
		// @ts-expect-error set is not in the types; we wanna test here that we guard against mutation in goto, too
		page.url.searchParams.set('q', 'updated');

		// @ts-expect-error
		goto(page.url);
	}

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var button = $.sibling(h1, 2);

	$.template_effect(() => $.set_text(text, $$props.data.q));
	$.delegated('click', button, update_q);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);