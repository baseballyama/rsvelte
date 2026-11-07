import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { Button } from "@svar-ui/svelte-core";
import { getData, repeatData } from "../data";

var root = $.from_html(`<div class="demo" style="padding: 20px;"><h4>Print grid</h4> <div><!></div> <div style="height: 400px; margin-top: 10px;"><!></div> <h4>Print tree structured grid</h4> <div><!></div> <div style="height: 400px; margin-top: 10px;"><!></div></div>`);

export default function Print($$anchor, $$props) {
	$.push($$props, true);

	const { treeData, treeColumns } = getData();
	const data = repeatData(100);

	const columns = [
		{
			id: "id",
			width: 50,
			footer: { text: "All users", colspan: 7 },
			sort: true
		},

		{
			id: "firstName",
			header: [
				{ text: "Main client info", colspan: 5, collapsible: true },
				{ text: "User", colspan: 2, collapsible: true },
				{ text: "First Name" }
			],
			width: 150,
			sort: true
		},
		{ id: "lastName", header: ["", "", "Last Name"], width: 150 },
		{
			id: "email",
			header: ["", { text: "Email", rowspan: 2, vertical: true }, ""]
		},

		{
			id: "companyName",
			header: [
				"",
				{
					text: "Company",
					colspan: 2,
					collapsible: true,
					collapsed: true
				},
				{ text: "Name" }
			]
		},
		{ id: "city", width: 100, header: ["", "", "City"] },
		{
			id: "stars",
			header: { text: "Stars points", vertical: true },
			width: 50
		},

		{
			id: "date",
			template: (obj) => obj.toDateString(),
			header: "Joined",
			footer: { text: data.length, css: "right" }
		}
	];

	let api1 = $.state(void 0);
	let api2 = $.state(void 0);

	function printGrid(api) {
		api.exec("print");
	}

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Button(node, {
		onclick: () => printGrid($.get(api1)),
		type: "primary",
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Print Grid');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.bind_this(
		Grid(node_1, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			rowStyle: (row) => row.id == 3 ? "rowStyle" : "",
			footer: true
		}),
		($$value) => $.set(api1, $$value, true),
		() => $.get(api1)
	);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 4);
	var node_2 = $.child(div_3);

	Button(node_2, {
		onclick: () => printGrid($.get(api2)),
		type: "primary",
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Print Grid');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	$.bind_this(
		Grid(node_3, {
			tree: true,
			get data() {
				return treeData;
			},

			get columns() {
				return treeColumns;
			},
			footer: true
		}),
		($$value) => $.set(api2, $$value, true),
		() => $.get(api2)
	);

	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}