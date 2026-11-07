import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, readable, derived } from './unknown';

export default function No_svelte_store01_input($$anchor, $$props) {
	$.push($$props, true);

	const w = writable();
	const r = readable();
	const d = derived([a, b], () => {});

	$.pop();
}