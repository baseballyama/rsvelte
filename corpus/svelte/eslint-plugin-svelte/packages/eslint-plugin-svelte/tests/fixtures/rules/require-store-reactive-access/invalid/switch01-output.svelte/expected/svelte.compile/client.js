import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Switch01_output($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $constStore = () => $.store_get(constStore, '$constStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	const constStore = writable('hello');

	switch ($store()) {
		case 'hello':
			console.log('hello');
			break;

		default:
			console.log('other');
	}

	switch ($constStore()) {
		case 'hello':
			console.log('hello');
			break;

		default:
			console.log('other');
	}

	$.pop();
	$$cleanup();
}