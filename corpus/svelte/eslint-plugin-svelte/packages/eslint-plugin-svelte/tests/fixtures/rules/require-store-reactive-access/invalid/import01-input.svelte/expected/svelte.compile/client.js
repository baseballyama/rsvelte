import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Import01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');

	async function foo() {
		return [await import(store), await import(constStore)];
	}

	$.pop();
}