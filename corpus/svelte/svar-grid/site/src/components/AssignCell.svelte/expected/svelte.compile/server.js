import * as $ from 'svelte/internal/server';
import { getData } from "../data";

export default function AssignCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column } = $$props;
		const employeesData = getData().employees;

		function getEmployees(data, value) {
			const result = [];

			for (let i = 0; i < data.length; i++) {
				const item = data[i];

				if (value.indexOf(item.id) !== -1) result.push(item);
				if (result.length === value.length) break;
			}

			return result;
		}

		let employees = $.derived(() => getEmployees(employeesData, row[column.id]));

		if (employees().length) {
			$$renderer.push(`<!--[0--><div class="employees svelte-18tc0gp"><!--[-->`);

			const each_array = $.ensure_array_like(employees());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let employee = each_array[$$index];

				$$renderer.push(`<div class="employee svelte-18tc0gp"><div class="avatar svelte-18tc0gp"><img${$.attr('src', employee.avatar)} alt="avatar" class="svelte-18tc0gp"/></div> <span>${$.escape(employee.label)}</span></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}