import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import { count } from './store.js';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function increment() {
		$.update_store(count, $count());
	}

	var $$exports = { increment };

	Nested($$anchor, {});

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}