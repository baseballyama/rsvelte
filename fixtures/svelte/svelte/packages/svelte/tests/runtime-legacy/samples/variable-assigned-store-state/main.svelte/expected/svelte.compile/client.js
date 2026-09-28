import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Test from './Test.svelte';

var root = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let counter = 1;
	let store = writable(counter);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Test(node, {
		get store() {
			return store;
		}
	});

	$.event('click', button, () => store = writable(++counter));
	$.append($$anchor, fragment);
	$.pop();
}