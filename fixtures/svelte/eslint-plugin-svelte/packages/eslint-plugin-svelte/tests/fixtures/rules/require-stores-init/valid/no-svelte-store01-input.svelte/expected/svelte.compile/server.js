import * as $ from 'svelte/internal/server';
import { writable, readable, derived } from './unknown';

export default function No_svelte_store01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const w = writable();
		const r = readable();
		const d = derived([a, b], () => {});
	});
}