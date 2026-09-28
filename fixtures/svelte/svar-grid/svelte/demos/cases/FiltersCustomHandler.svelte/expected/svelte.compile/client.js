import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div class="demo" style="padding: 20px;"><h4>Grid with header filters and custom filter handler</h4> <p>Filter by "First Name" or "Last Name"</p> <div style="height: 400px;"><!></div></div>`);

export default function FiltersCustomHandler($$anchor, $$props) {
	$.push($$props, true);

	const { allData } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{
			id: "city",
			width: 100,
			header: { text: "City", rowspan: 2 },
			footer: "City"
		},

		{
			id: "firstName",
			header: ["First Name", { filter: "text" }],
			footer: "First Name"
		},

		{
			id: "lastName",
			header: ["Last Name", { filter: "text" }],
			footer: "Last Name",
			filter: { type: "text" }
		},

		{
			id: "email",
			header: { text: "Email", rowspan: 2 },
			footer: "Email",
			width: 230
		}
	];

	function init(api) {
		api.intercept("filter-rows", (ev) => {
			const { filterValues } = api.getState();
			const { value, key } = ev;

			filterValues[key] = value;
			ev.filter = createFilter(filterValues);
		});
	}

	function createFilter(filterValues) {
		const filters = Object.keys(filterValues).filter((key) => filterValues[key]).map((key) => {
			const value = filterValues[key];

			return (v) => {
				if (v[key]) return v[key].toLowerCase().indexOf(value.toLowerCase()) !== -1;
			};
		});

		return (obj) => {
			if (!filters.length) return true;

			for (let i = 0; i < filters.length; i++) {
				if (filters[i](obj)) {
					return true;
				}
			}

			return false;
		};
	}

	var div = root();
	var div_1 = $.sibling($.child(div), 4);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return allData;
		},

		get columns() {
			return columns;
		},
		init
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}