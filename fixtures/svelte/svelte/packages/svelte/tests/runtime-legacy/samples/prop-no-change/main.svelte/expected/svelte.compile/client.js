import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<button>reassign</button> <!>`, 1);

export default function Main($$anchor) {
	let value = { count: 1 };
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Nested(node, {
		get primitive() {
			return value.count;
		},

		get object() {
			return value;
		}
	});

	$.event('click', button, () => value = { count: 1 });
	$.append($$anchor, fragment);
}