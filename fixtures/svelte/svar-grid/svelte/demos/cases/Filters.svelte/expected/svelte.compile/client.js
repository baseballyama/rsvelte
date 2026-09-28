import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div class="demo svelte-14bainq" style="padding: 20px;"><h4>Grids with header filters</h4> <!> <div style="height: 400px;margin: 10px 0 20px;"><!></div> <!> <div style="height: 600px;margin-top:10px"><!></div></div>`);

export default function Filters($$anchor, $$props) {
	$.push($$props, true);

	const { allData, data, countries, users } = getData();

	const dateFormat = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});

	const columns = [
		{ id: "id", width: 50 },
		{
			id: "firstName",
			header: { filter: "text" },
			footer: "First Name",
			width: 150
		},

		{
			id: "lastName",
			header: { filter: { type: "text" } },
			footer: "Last Name",
			width: 150
		},
		{ id: "email", header: "Email", footer: "Email" },
		{
			id: "country",
			header: {
				filter: { type: "richselect", config: { options: countries } }
			},
			options: countries
		},

		{
			id: "destinations",
			header: { filter: { type: "multiselect" } },
			footer: "Destinations",
			options: countries,
			width: 200
		},

		{
			id: "date",
			header: { filter: "datepicker" },
			template: (obj) => dateFormat.format(obj),
			width: 180
		},
		{ id: "stars", header: { filter: "text" }, footer: "Stars" }
	];

	const columnsSpans = [
		{
			id: "id",
			width: 50,
			footer: { text: "All users", colspan: 7 }
		},

		{
			id: "firstName",
			header: [
				{
					text: "Main client info",
					colspan: 3,
					collapsible: true,
					open: true
				},
				{ text: "First Name" },
				{ filter: "text" }
			],
			width: 150
		},

		{
			id: "lastName",
			header: ["", "Last Name", { filter: "text" }],
			width: 150
		},

		{
			id: "email",
			header: ["", { collapsible: true, text: "Email" }, { filter: "text" }]
		},

		{
			id: "companyName",
			header: [
				{ text: "Company", colspan: 2, collapsible: true },
				{ text: "Name", rowspan: 2 },
				""
			]
		},

		{
			id: "country",
			options: countries,
			header: ["", "Country", { filter: { type: "richselect" } }]
		},

		{
			id: "date",
			width: 180,
			template: (obj) => dateFormat.format(obj),
			header: [{ text: "Joined", rowspan: 2 }, { filter: "datepicker" }]
		},

		{
			id: "user",
			header: [
				{ text: "Assigned", rowspan: 2 },
				{ filter: { type: "richselect" } }
			],
			footer: { text: data.length, css: "right" },
			width: 180,
			options: users
		}
	];

	columns.forEach((c) => {
		c.sort = true;
		c.resize = true;
	});

	columnsSpans.forEach((c) => {
		c.sort = true;
		c.resize = true;
	});

	let grid1 = $.state(void 0);
	let grid2 = $.state(void 0);

	function clear(grid) {
		grid.exec("filter-rows", {});
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	Button(node, {
		type: 'primary',
		onclick: () => clear($.get(grid1)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Clear filters');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	$.bind_this(
		Grid(node_1, {
			get data() {
				return allData;
			},

			get columns() {
				return columns;
			}
		}),
		($$value) => $.set(grid1, $$value, true),
		() => $.get(grid1)
	);

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	Button(node_2, {
		type: 'primary',
		onclick: () => clear($.get(grid2)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Clear filters');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_2, 2);
	var node_3 = $.child(div_2);

	$.bind_this(
		Grid(node_3, {
			get data() {
				return allData;
			},

			get columns() {
				return columnsSpans;
			},
			footer: true
		}),
		($$value) => $.set(grid2, $$value, true),
		() => $.get(grid2)
	);

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}