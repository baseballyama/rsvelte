import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function If_statement01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');

	if (store) {
		console.log(store);
	}

	if (constStore) {
		console.log(constStore);
	}

	$.pop();
}