import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Spread01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable([42]);
	const constStore = writable(['hello']);

	console.log(...store);
	console.log(...constStore);
	$.pop();
}