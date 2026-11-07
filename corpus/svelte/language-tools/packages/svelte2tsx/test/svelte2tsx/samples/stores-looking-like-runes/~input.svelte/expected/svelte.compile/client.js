import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $props = () => $.store_get(props, '$props', $$stores);
	const $state = () => $.store_get(state, '$state', $$stores);
	const $derived = () => $.store_get(derived, '$derived', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const props = null;

	$props();

	const state = null;

	$state();

	const derived = null;

	$derived();
	$.next();

	var text = $.text();

	text.nodeValue = ' ';
	$.append($$anchor, text);
	$$cleanup();
}