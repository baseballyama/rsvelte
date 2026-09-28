import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let entries = [{ selected: 'a' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(entries);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let entry = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(entry.selected)} `);
		$$renderer.select({ value: entry.selected }, ($$renderer) => {});
	}

	$$renderer.push(`<!--]--> <button>change</button>`);
}