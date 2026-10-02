import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Base reordering</h4> <div style="width: 800px; height: 400px;"><!></div></div> <div style="padding: 20px;"><h4>Reordering with a drag handle</h4> <div style="width: 800px; height: 400px;"><!></div></div> <div style="padding: 20px;"><h4>Restrictive drag handlers (rows without drag handlers cannot be moved)</h4> <div style="width: 800px; height: 400px;"><!></div></div>`, 1);

export default function Reordering($$anchor, $$props) {
	$.push($$props, true);

	const rows = 100;
	const cols = 20;
	const data = repeatData(rows, cols);
	const columns = repeatColumns(cols);
	const columnsWithDraggable = repeatColumns(cols);
	const columnsWithSelectiveDraggable = repeatColumns(cols);

	columnsWithDraggable[0].draggable = true;
	columnsWithSelectiveDraggable[0].draggable = (row) => row.id % 2 === 1;

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
		reorder: true
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
			return columnsWithDraggable;
		},
		footer: true,
		reorder: true
	});

	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.sibling($.child(div_4), 2);
	var node_2 = $.child(div_5);

	Grid(node_2, {
		get data() {
			return data;
		},

		get columns() {
			return columnsWithSelectiveDraggable;
		},
		footer: true,
		reorder: true
	});

	$.reset(div_5);
	$.reset(div_4);
	$.append($$anchor, fragment);
	$.pop();
}