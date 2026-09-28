import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData, repeatColumns } from "../data";
import { Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><p><!></p> <div><!></div></div>`);

export default function Styling($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();
	const columns = repeatColumns(50);
	let cellStyle = $.state(void 0);
	let i = 0;

	function setCellStyle() {
		let id = data[i].id;

		$.set(cellStyle, (row, col) => row.id == id && col.id == "lastName" ? "cellStyle" : "");
		i = i == data.length - 1 ? 0 : i + 1;
	}

	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	Button(node, {
		type: 'primary',
		onclick: () => setCellStyle(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Set cell style');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var node_1 = $.child(div_1);

	Grid(node_1, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},

		get cellStyle() {
			return $.get(cellStyle);
		},
		rowStyle: (row) => row.id == 12 ? "rowStyle" : "",
		columnStyle: (col) => col.id == "city" ? "columnStyle" : "",
		footer: true
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}