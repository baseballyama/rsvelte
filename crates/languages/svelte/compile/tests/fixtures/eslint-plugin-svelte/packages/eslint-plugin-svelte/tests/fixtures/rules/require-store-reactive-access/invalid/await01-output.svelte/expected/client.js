import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Await01_output($$anchor, $$props) {
	$.push($$props, true);

	const $constStore = () => $.store_get(constStore, '$constStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable('hello');
	const constStore = writable('hello');

	async function foo() {
		return [await store, await $constStore()];
	}

	$.pop();
	$$cleanup();
}