import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function _1_untrack_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a, b } = $$props;
		// this will run when `a` changes,
		// but not when `b` changes
	});
}