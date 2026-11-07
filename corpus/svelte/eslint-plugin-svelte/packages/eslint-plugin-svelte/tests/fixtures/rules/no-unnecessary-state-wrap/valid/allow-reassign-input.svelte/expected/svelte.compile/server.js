import * as $ from 'svelte/internal/server';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

export default function Allow_reassign_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// These should be allowed when allowReassign is true and variables are reassigned
		let set = new SvelteSet();

		set = new SvelteSet([1, 2, 3]);

		let map = new SvelteMap();

		map = new SvelteMap([['key', 'value']]);
	});
}