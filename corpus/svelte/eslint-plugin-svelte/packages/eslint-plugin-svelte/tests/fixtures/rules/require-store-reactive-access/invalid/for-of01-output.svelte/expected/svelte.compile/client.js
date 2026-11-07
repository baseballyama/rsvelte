import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function For_of01_output($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $constStore = () => $.store_get(constStore, '$constStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	const constStore = writable('hello');

	for (const c of $store()) {
		console.log(c);
	}

	for (const c of $constStore()) {
		console.log(c);
	}

	$.pop();
	$$cleanup();
}