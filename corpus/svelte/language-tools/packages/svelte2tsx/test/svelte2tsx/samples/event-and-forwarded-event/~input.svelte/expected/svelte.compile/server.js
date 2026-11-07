import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from "svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		dispatch("mount", { input });
		$$renderer.push(`<input/>`);
	});
}