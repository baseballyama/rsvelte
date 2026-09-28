import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div class="demo-container svelte-1utfudl"><div><h4>Click on header cells to sort the data</h4> <!></div> <div><h4>Resort data after editing a cell</h4> <!></div></div>`);

export default function Sort($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50, sort: true },
		{ id: "city", header: "City", width: 160, sort: true },
		{ id: "email", header: "Email", width: 250, sort: true },
		{ id: "firstName", header: "First Name", sort: true },
		{ id: "lastName", header: "Last Name", sort: true }
	];

	const columnsSortOnUpdate = [
		{ id: "id", width: 50, sort: true },
		{
			id: "city",
			header: "City",
			width: 160,
			sort: true,
			editor: "text"
		},

		{
			id: "firstName",
			header: "First Name",
			sort: true,
			editor: "text"
		},

		{
			id: "lastName",
			header: "Last Name",
			sort: true,
			editor: "text"
		}
	];

	function init(api) {
		api.on("update-cell", () => {
			const marks = api.getState().sortMarks;

			for (let key in marks) {
				api.exec("sort-rows", { key, order: marks[key].order, add: marks[key].index ?? true });
			}
		});
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Grid(node, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2), 2);

	Grid(node_1, {
		get data() {
			return data;
		},
		init,
		get columns() {
			return columnsSortOnUpdate;
		}
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}