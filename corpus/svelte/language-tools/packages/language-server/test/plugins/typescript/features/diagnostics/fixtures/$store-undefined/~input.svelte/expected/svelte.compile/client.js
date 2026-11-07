import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $interfaceStore = () => $.store_get(interfaceStore, '$interfaceStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let interfaceStore;

	// error
	$interfaceStore().fn();

	const result1 = $interfaceStore() ? $interfaceStore().fn() === '1' : false;

	result1;

	// ok
	$interfaceStore()?.fn();

	const result2 = $interfaceStore() ? $interfaceStore().fn() === 1 : false;

	result2;
	$$cleanup();
}