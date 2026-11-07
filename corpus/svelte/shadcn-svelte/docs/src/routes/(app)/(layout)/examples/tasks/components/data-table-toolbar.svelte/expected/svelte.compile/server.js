import * as $ from 'svelte/internal/server';
import XIcon from "@lucide/svelte/icons/x";
import Button from "$lib/registry/ui/button/button.svelte";
import { Input } from "$lib/registry/ui/input/index.js";
import { DataTableFacetedFilter, DataTableViewOptions } from "./index.js";
import { priorities, statuses } from "../data/data.js";

export default function Data_table_toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { table } = $$props;
		const isFiltered = $.derived(() => table.atoms.columnFilters.get().length > 0);
		const statusCol = $.derived(() => table.getColumn("status"));
		const priorityCol = $.derived(() => table.getColumn("priority"));

		$$renderer.push(`<div class="flex items-center justify-between"><div class="flex flex-1 items-center space-x-2">`);

		Input($$renderer, {
			placeholder: 'Filter tasks...',
			value: table.getColumn("title")?.getFilterValue() ?? "",
			oninput: (e) => {
				table.getColumn("title")?.setFilterValue(e.currentTarget.value);
			},

			onchange: (e) => {
				table.getColumn("title")?.setFilterValue(e.currentTarget.value);
			},
			class: 'h-8 w-[150px] lg:w-[250px]'
		});

		$$renderer.push(`<!----> `);

		if (statusCol()) {
			$$renderer.push('<!--[0-->');
			DataTableFacetedFilter($$renderer, { column: statusCol(), title: 'Status', options: statuses });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (priorityCol()) {
			$$renderer.push('<!--[0-->');

			DataTableFacetedFilter($$renderer, {
				column: priorityCol(),
				title: 'Priority',
				options: priorities
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (isFiltered()) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'ghost',
				onclick: () => table.resetColumnFilters(),
				class: 'h-8 px-2 lg:px-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Reset `);
					XIcon($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);
		DataTableViewOptions($$renderer, { table });
		$$renderer.push(`<!----></div>`);
	});
}