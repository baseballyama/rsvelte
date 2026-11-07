import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function _1_input($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);

	console.log($count()); // logs 0
	count.set(1);
	console.log($count()); // logs 1
	$.store_set(count, 2);
	console.log($count()); // logs 2
	$.pop();
	$$cleanup();
}