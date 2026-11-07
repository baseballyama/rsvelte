import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import SelectionCheckboxCell from "../custom/SelectionCheckboxCell.svelte";
import SelectionCheckboxBind from "../custom/SelectionCheckboxBind.svelte";
import { getData } from "../data";

var root = $.from_html(`<div class="demo svelte-1xzn48y" style="padding: 20px;"><h4>Select only by checkboxes</h4> <div><!></div></div> <div class="demo svelte-1xzn48y" style="padding: 20px;"><h4>Select by checkboxes and clicking</h4> <div><!></div></div>`, 1);

export default function SelectionCheckboxes($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "selected", cell: SelectionCheckboxCell, width: 36 },
		{ id: "city", header: "City", width: 160 },
		{ id: "firstName", header: "First Name" },
		{ id: "lastName", header: "Last Name" },
		{ id: "companyName", header: "Company" }
	];

	const columnsBind = [
		{ id: "selected", cell: SelectionCheckboxBind, width: 36 },
		{ id: "city", header: "City", width: 160 },
		{ id: "firstName", header: "First Name" },
		{ id: "lastName", header: "Last Name" },
		{ id: "companyName", header: "Company" }
	];

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},
		select: false
	});

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_1 = $.child(div_3);

	Grid(node_1, {
		get data() {
			return data;
		},

		get columns() {
			return columnsBind;
		},
		multiselect: true,
		selectedRows: [13]
	});

	$.reset(div_3);
	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}