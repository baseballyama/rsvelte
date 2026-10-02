import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $a = () => $.store_get(a, '$a', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a;

	$a();
	$$cleanup();
}