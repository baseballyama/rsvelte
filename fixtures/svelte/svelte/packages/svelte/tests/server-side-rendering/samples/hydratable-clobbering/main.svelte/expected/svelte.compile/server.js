import * as $ from 'svelte/internal/server';
import { hydratable } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		hydratable('key', () => 'first');
		hydratable('key', () => 'second');
	});
}