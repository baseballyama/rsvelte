import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import App from './App.svelte';

var root = $.from_html(`<button>remount</button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.key(node, () => $.get(count), ($$anchor) => {
		App($$anchor, {
			get count() {
				return $.get(count);
			}
		});
	});

	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);