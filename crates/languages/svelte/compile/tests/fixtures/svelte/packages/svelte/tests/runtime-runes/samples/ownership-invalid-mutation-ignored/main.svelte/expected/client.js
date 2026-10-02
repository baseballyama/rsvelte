import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let test = $.proxy({ test: 'a' });
	const store = writable(test);

	Child($$anchor, {
		get test() {
			return test;
		},

		get store() {
			return store;
		}
	});

	$.pop();
}