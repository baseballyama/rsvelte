import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XIcon from "@lucide/svelte/icons/x";
import Button from "$lib/registry/ui/button/button.svelte";
import { Input } from "$lib/registry/ui/input/index.js";
import { DataTableFacetedFilter, DataTableViewOptions } from "./index.js";
import { priorities, statuses } from "../data/data.js";

var root = $.from_html(`Reset <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><div class="flex flex-1 items-center space-x-2"><!> <!> <!> <!></div> <!></div>`);

export default function Data_table_toolbar($$anchor, $$props) {
	$.push($$props, true);

	const isFiltered = $.derived(() => $$props.table.atoms.columnFilters.get().length > 0);
	const statusCol = $.derived(() => $$props.table.getColumn("status"));
	const priorityCol = $.derived(() => $$props.table.getColumn("priority"));
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $$props.table.getColumn("title")?.getFilterValue() ?? "");

		Input(node, {
			placeholder: 'Filter tasks...',
			get value() {
				return $.get($0);
			},

			oninput: (e) => {
				$$props.table.getColumn("title")?.setFilterValue(e.currentTarget.value);
			},

			onchange: (e) => {
				$$props.table.getColumn("title")?.setFilterValue(e.currentTarget.value);
			},
			class: 'h-8 w-[150px] lg:w-[250px]'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			DataTableFacetedFilter($$anchor, {
				get column() {
					return $.get(statusCol);
				},
				title: 'Status',
				get options() {
					return statuses;
				}
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(statusCol)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			DataTableFacetedFilter($$anchor, {
				get column() {
					return $.get(priorityCol);
				},
				title: 'Priority',
				get options() {
					return priorities;
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(priorityCol)) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			Button($$anchor, {
				variant: 'ghost',
				onclick: () => $$props.table.resetColumnFilters(),
				class: 'h-8 px-2 lg:px-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root();
					var node_4 = $.sibling($.first_child(fragment_3));

					XIcon(node_4, {});
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if ($.get(isFiltered)) $$render(consequent_2);
		});
	}

	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	DataTableViewOptions(node_5, {
		get table() {
			return $$props.table;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}