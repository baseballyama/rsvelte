import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function For_in01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');

	for (const k in store) {
		console.log(k);
	}

	for (const k in constStore) {
		console.log(k);
	}

	$.pop();
}