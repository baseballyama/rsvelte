import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from "svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		dispatch('hi', true);

		function bye() {
			const bla = 'bye';

			dispatch(bla, false);
		}

		$$renderer.push(`<button></button>`);
	});
}