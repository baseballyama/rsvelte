import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $state = () => $.store_get(state, '$state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const state = 42;

	$state()();
	$$cleanup();
}