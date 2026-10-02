import * as $ from 'svelte/internal/server';
import { derived } from 'svelte/store';

export default function Spread01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const args = [[a, b], () => {}, false];
		const d = derived(...args);
	});
}