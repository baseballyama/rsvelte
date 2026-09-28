import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";

var root = $.from_html(`<div class="employee svelte-18tc0gp"><div class="avatar svelte-18tc0gp"><img alt="avatar" class="svelte-18tc0gp"/></div> <span> </span></div>`);
var root_1 = $.from_html(`<div class="employees svelte-18tc0gp"></div>`);

export default function AssignCell($$anchor, $$props) {
	$.push($$props, true);

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

	let employees = $.derived(() => getEmployees(employeesData, $$props.row[$$props.column.id]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 21, () => $.get(employees), (employee) => employee.id, ($$anchor, employee) => {
				var div_1 = root();
				var div_2 = $.child(div_1);
				var img = $.only_child(div_2);
				var span = $.sibling(div_2, 2);
				var text = $.only_child(span, true);

				$.reset(div_1);

				$.template_effect(() => {
					$.set_attribute(img, 'src', $.get(employee).avatar);
					$.set_text(text, $.get(employee).label);
				});

				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(employees).length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}