import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { addToPanel } from '$lib/index.js';
import deepNest from '../deep-nest.js';

var root = $.from_html(`<h2>Global Inspect</h2> <button>add</button> <button>remove</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// import { onDestroy } from 'svelte'
	addToPanel('nested', () => deepNest);

	let remove;

	function add() {
		remove = addToPanel('nesteda', () => ({ ...deepNest }));
	}

	// onDestroy(() => {
	//   remove?.()
	// })
	$.user_effect(() => {
		const cleanup = addToPanel('nestedc', () => ({ ...deepNest }));

		return cleanup;
	});

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, add);
	$.delegated('click', button_1, () => remove?.());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);