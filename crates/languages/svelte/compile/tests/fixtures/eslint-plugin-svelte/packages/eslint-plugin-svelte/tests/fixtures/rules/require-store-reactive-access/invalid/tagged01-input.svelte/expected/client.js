import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Tagged01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable((...args) => args.join(','));
	const constStore = writable((...args) => args.join(','));

	console.log(store`abc`);
	console.log(constStore`abc`);
	$.pop();
}