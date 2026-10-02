import * as $ from 'svelte/internal/server';
import { writable, readable, derived } from 'svelte/store';

export default function No_init01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const w = writable();
		const r = readable();
		const d = derived([a, b], () => {});
	});
}