import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Switch01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');

	switch (store) {
		case 'hello':
			console.log('hello');
			break;

		default:
			console.log('other');
	}

	switch (constStore) {
		case 'hello':
			console.log('hello');
			break;

		default:
			console.log('other');
	}

	$.pop();
}