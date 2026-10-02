import * as $ from 'svelte/internal/server';
import { Text } from "@svar-ui/svelte-core";
import { getData } from "../data";

export default function SearchList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { employees, positions } = getData();
		let searchValue = "";

		let employeesFiltered = $.derived(() => searchValue
			? employees.filter((e) => e.firstName.toLowerCase().includes(searchValue.toLowerCase()))
			: employees);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="column svelte-1hhf5b0">`);

			Text($$renderer, {
				icon: 'wxi-search',
				css: 'wx-icon-left',
				placeholder: "Search...",
				get value() {
					return searchValue;
				},

				set value($$value) {
					searchValue = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="list svelte-1hhf5b0"><!--[-->`);

			const each_array = $.ensure_array_like(employeesFiltered());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let employee = each_array[$$index];

				$$renderer.push(`<div class="card svelte-1hhf5b0"><div class="avatar svelte-1hhf5b0">`);

				if (employee.avatar) {
					$$renderer.push(`<!--[0--><img${$.attr('src', employee.avatar)} alt="avatar" class="svelte-1hhf5b0"/>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="avatar-box svelte-1hhf5b0"><span>${$.escape(employee.firstName[0])}</span></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="info svelte-1hhf5b0"><span class="name">${$.escape(employee.firstName)} ${$.escape(employee.lastName)}</span> <span class="position svelte-1hhf5b0">${$.escape(positions.find((p) => p.id === employee.position).name)}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}