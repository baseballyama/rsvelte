import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, readable, derived } from 'svelte/store';

export default function Has_init01_input($$anchor, $$props) {
	$.push($$props, true);

	const w = writable(false);
	const r = readable({});
	const d = derived([a, b], () => {}, false);

	$.pop();
}