import * as $ from 'svelte/internal/server';
import Row from "./Component.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nums = [];
		const rows = $.derived(() => nums.map((n) => ({ id: n, name: `Row ${n}` })));
		const refs = {};

		$$renderer.push(`<button>Add</button> <!--[-->`);

		const each_array = $.ensure_array_like(rows());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let row = each_array[$$index];

			Row($$renderer, { name: row.name });
		}

		$$renderer.push(`<!--]-->`);
	});
}