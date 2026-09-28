import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { twMerge } from "tailwind-merge";
import { setContext } from "svelte";

var root = $.from_html(`<th scope="col"> </th>`);
var root_1 = $.from_html(`<div><table><thead><tr><!></tr></thead><tbody><!></tbody></table></div>`);

export default function TableProp($$anchor, $$props) {
	$.push($$props, true);

	let category = $.prop($$props, 'category', 3, "props"),
		tableClass = $.prop($$props, 'tableClass', 3, "w-full text-sm text-left text-gray-500 dark:text-gray-400"),
		theadClass = $.prop($$props, 'theadClass', 3, "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"),
		thClass = $.prop($$props, 'thClass', 3, "px-6 py-3"),
		divClass = $.prop($$props, 'divClass', 3, "w-full relative overflow-x-auto shadow-md sm:rounded-lg py-4");

	$.user_effect(() => {
		$.user_effect(() => {
			$.user_effect(() => {
				setContext("category", category());
			});
		});
	});

	const headerNames = {
		props: ["Name", "Type", "Default"],
		events: ["Names"],
		slots: ["Names"]
	};

	let header = $.derived(() => headerNames[category()]);
	var div = root_1();
	var table = $.child(div);
	var thead = $.child(table);
	var tr = $.child(thead);
	var node = $.child(tr);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => $.get(header), $.index, ($$anchor, column) => {
				var th = root();
				var text = $.only_child(th, true);

				$.template_effect(() => {
					$.set_class(th, 1, $.clsx(thClass()));
					$.set_text(text, $.get(column));
				});

				$.append($$anchor, th);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var th_1 = root();
			var text_1 = $.only_child(th_1, true);

			$.template_effect(() => {
				$.set_class(th_1, 1, $.clsx(thClass()));
				$.set_text(text_1, $.get(header));
			});

			$.append($$anchor, th_1);
		};

		$.if(node, ($$render) => {
			if (category() === "props") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);
	var node_2 = $.child(tbody);

	$.snippet(node_2, () => $$props.children);
	$.reset(tbody);
	$.reset(table);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $.clsx(divClass()));
			$.set_class(table, 1, $.clsx(tableClass()));
			$.set_class(thead, 1, $0);
		},
		[() => $.clsx(twMerge(theadClass(), $$props.class))]
	);

	$.append($$anchor, div);
	$.pop();
}