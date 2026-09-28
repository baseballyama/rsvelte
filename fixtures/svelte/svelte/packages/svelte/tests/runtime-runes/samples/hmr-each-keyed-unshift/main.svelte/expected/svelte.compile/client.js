import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>unshift</button> <!>`, 1);

export default function Main($$anchor) {
	let uid = 0;

	/** @type {Array<{ id: number }>} */
	let items = $.proxy([]);

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
		Child($$anchor, {});
	});

	$.delegated('click', button, () => items.unshift({ id: uid++ }));
	$.append($$anchor, fragment);
}

$.delegate(['click']);