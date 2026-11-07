import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function For_of01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');

	for (const c of store) {
		console.log(c);
	}

	for (const c of constStore) {
		console.log(c);
	}

	$.pop();
}