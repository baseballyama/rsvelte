import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { a } from "./stores";

export default function $var_input($$anchor) {
	const $a = () => $.store_get(a, '$a', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.store_set(a, 42);
	$$cleanup();
}