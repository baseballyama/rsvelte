import * as $ from 'svelte/internal/server';
import { createEventDispatcher, abc } from "svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const notDispatch = abc();
		const dispatch1 = createEventDispatcher();
		const dispatch2 = createEventDispatcher();

		dispatch1('hi', true);
		dispatch2('bye', true);
		$$renderer.push(`<button></button>`);
	});
}