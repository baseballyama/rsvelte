import * as $ from 'svelte/internal/server';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

export default function Allow_reassign_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// These should be reported as unnecessary $state wrapping
		// even with allowReassign: true because they are not reassigned
		const set = new SvelteSet();

		let map = new SvelteMap();
	});
}