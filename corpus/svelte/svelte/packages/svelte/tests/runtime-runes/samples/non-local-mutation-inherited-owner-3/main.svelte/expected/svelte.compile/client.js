import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>First click here</button> <!>`, 1);

export default function Main($$anchor) {
	let items = $.proxy([
		{ id: "test", name: "this is a test" },
		{ id: "test2", name: "this is a second test" }
	]);

	let found = $.state(void 0);

	function onclick() {
		$.set(found, items.find((c) => c.id === 'test2'), true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Child(node, {
		get item() {
			return $.get(found);
		}
	});

	$.delegated('click', button, onclick);
	$.append($$anchor, fragment);
}

$.delegate(['click']);