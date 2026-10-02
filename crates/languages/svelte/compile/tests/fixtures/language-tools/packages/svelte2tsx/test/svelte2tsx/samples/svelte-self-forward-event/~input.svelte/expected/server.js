import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from "svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = [''];
		const dispatch = createEventDispatcher();

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(a);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Input($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}