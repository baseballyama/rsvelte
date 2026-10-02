import * as $ from 'svelte/internal/server';
import { SvelteSet as CustomSet, SvelteMap as CustomMap } from 'svelte/reactivity';

export default function Import_alias_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// These should be reported as unnecessary $state wrapping
		const set = new CustomSet();

		const map = new CustomMap();
	});
}