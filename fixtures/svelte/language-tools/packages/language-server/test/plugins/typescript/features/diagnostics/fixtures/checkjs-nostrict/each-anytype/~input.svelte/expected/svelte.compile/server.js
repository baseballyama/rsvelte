import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let anyType;

		async function load() {
			anyType = await (await fetch('')).json();
		}

		load();
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(anyType);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let anyEntry = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(anyEntry.asd())}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}