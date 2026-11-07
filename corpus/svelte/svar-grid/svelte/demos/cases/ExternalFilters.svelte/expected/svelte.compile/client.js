import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, DateRangePicker, Text } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div class="demo" style="padding: 20px;"><h4>Grid with external filters</h4> <div style="max-width:810px"><div class="controls svelte-bvxjbr"><!> <!></div> <div style="height: 400px;"><!></div></div></div>`);

export default function ExternalFilters($$anchor, $$props) {
	$.push($$props, true);

	const { allData } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "firstName", header: "First Name", footer: "First Name" },
		{ id: "lastName", header: "Last Name", footer: "Last Name" },
		{
			id: "date",
			header: "Date",
			template: (v) => v.toDateString(),
			width: 160
		},
		{ id: "companyName", header: "Company", flexgrow: 1 }
	];

	let tableApi = $.state(void 0);
	let dateValue = $.state(void 0);
	let companyValue = $.state("");

	function init(api) {
		$.set(tableApi, api, true);
	}

	function handleFilter() {
		const filterValues = { date: $.get(dateValue), companyName: $.get(companyValue) };
		const filter = createFilter(filterValues);

		$.get(tableApi).exec("filter-rows", { filter });
	}

	function createFilter(filterValues) {
		const filters = Object.keys(filterValues).filter((key) => filterValues[key]).map((key) => {
			const value = filterValues[key];

			switch (key) {
				case "companyName":
					{
						return (v) => {
							if (v[key]) return v[key].toLowerCase().indexOf(value.toLowerCase()) !== -1;
						};
					}

				case "date":
					{
						return (v) => {
							if (v[key]) return isDateInRange(v[key], value);
						};
					}
			}
		});

		return (obj) => {
			for (let i = 0; i < filters.length; i++) {
				if (!filters[i](obj)) {
					return false;
				}
			}

			return true;
		};
	}

	function isDateInRange(date, range) {
		const { start, end } = range;
		const nDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		return nDate >= start && nDate <= end;
	}

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Field(node, {
		label: 'Filter "Date" column',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				clear: true,
				onchange: handleFilter,
				get value() {
					return $.get(dateValue);
				},

				set value($$value) {
					$.set(dateValue, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Filter "Company" column',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				clear: true,
				icon: "wxi-search",
				onchange: handleFilter,
				get value() {
					return $.get(companyValue);
				},

				set value($$value) {
					$.set(companyValue, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Grid(node_2, {
		get data() {
			return allData;
		},

		get columns() {
			return columns;
		},
		init
	});

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}