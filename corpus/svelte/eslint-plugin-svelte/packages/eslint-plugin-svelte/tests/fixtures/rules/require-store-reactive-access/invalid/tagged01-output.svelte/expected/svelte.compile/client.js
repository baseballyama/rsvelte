import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Tagged01_output($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $constStore = () => $.store_get(constStore, '$constStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable((...args) => args.join(','));
	const constStore = writable((...args) => args.join(','));

	console.log($store()`abc`);
	console.log($constStore()`abc`);
	$.pop();
	$$cleanup();
}