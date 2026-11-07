import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text } from "@svar-ui/svelte-core";
import { getData } from "../data";

var root = $.from_html(`<img alt="avatar" class="svelte-1hhf5b0"/>`);
var root_1 = $.from_html(`<div class="avatar-box svelte-1hhf5b0"><span> </span></div>`);
var root_2 = $.from_html(`<div class="card svelte-1hhf5b0"><div class="avatar svelte-1hhf5b0"><!></div> <div class="info svelte-1hhf5b0"><span class="name"> </span> <span class="position svelte-1hhf5b0"> </span></div></div>`);
var root_3 = $.from_html(`<div class="column svelte-1hhf5b0"><!> <div class="list svelte-1hhf5b0"></div></div>`);

export default function SearchList($$anchor, $$props) {
	$.push($$props, true);

	const { employees, positions } = getData();
	let searchValue = $.state("");

	let employeesFiltered = $.derived(() => $.get(searchValue)
		? employees.filter((e) => e.firstName.toLowerCase().includes($.get(searchValue).toLowerCase()))
		: employees);

	var div = root_3();
	var node = $.child(div);

	Text(node, {
		icon: 'wxi-search',
		css: 'wx-icon-left',
		placeholder: "Search...",
		get value() {
			return $.get(searchValue);
		},

		set value($$value) {
			$.set(searchValue, $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => $.get(employeesFiltered), (employee) => employee.id, ($$anchor, employee) => {
		var div_2 = root_2();
		var div_3 = $.child(div_2);
		var node_1 = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				var img = root();

				$.template_effect(() => $.set_attribute(img, 'src', $.get(employee).avatar));
				$.append($$anchor, img);
			};

			var alternate = ($$anchor) => {
				var div_4 = root_1();
				var span = $.child(div_4);
				var text = $.only_child(span, true);

				$.reset(div_4);
				$.template_effect(() => $.set_text(text, $.get(employee).firstName[0]));
				$.append($$anchor, div_4);
			};

			$.if(node_1, ($$render) => {
				if ($.get(employee).avatar) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_3);

		var div_5 = $.sibling(div_3, 2);
		var span_1 = $.child(div_5);
		var text_1 = $.only_child(span_1);
		var span_2 = $.sibling(span_1, 2);
		var text_2 = $.only_child(span_2, true);

		$.reset(div_5);
		$.reset(div_2);

		$.template_effect(
			($0) => {
				$.set_text(text_1, `${$.get(employee).firstName ?? ''} ${$.get(employee).lastName ?? ''}`);
				$.set_text(text_2, $0);
			},
			[
				() => positions.find((p) => p.id === $.get(employee).position).name
			]
		);

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}