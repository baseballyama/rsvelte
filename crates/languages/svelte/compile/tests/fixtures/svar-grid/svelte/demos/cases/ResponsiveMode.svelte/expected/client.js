import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Button } from "@svar-ui/svelte-core";
import { Grid, HeaderMenu } from "../../src/";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="demo svelte-cd1n12"><h4>DataGrid can have different settings for different container width</h4> <!> <!></div>`);

export default function ResponsiveMode($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", footer: { text: "All users", colspan: 6 } },
		{ id: "firstName", header: "First Name", flexgrow: 1 },
		{ id: "lastName", header: "Last Name" },
		{ id: "city", header: "City" },
		{ id: "user", header: "User ID" },
		{ id: "email", header: "Email" },
		{
			id: "date",
			header: "Date",
			footer: { text: data.length, css: "right" }
		}
	];

	const responsive = {
		"1000": {
			columns: [
				{
					id: "id",
					footer: { text: "All users", colspan: 6 },
					flexgrow: 1
				},
				{ id: "firstName", header: "First Name", flexgrow: 1 },
				{ id: "lastName", header: "Last Name", flexgrow: 1 },
				{ id: "city", header: "City", hidden: true, flexgrow: 1 },
				{ id: "user", header: "User ID", flexgrow: 1 },
				{ id: "email", header: "Email", hidden: true, flexgrow: 1 },
				{
					id: "date",
					header: "Date",
					footer: { text: data.length, css: "right" },
					flexgrow: 1
				}
			],
			sizes: {
				rowHeight: 40,
				columnWidth: 160,
				headerHeight: 40,
				footerHeight: 40
			}
		},
		"600": {
			columns: [
				{
					id: "id",
					width: 50,
					footer: { text: "All users", colspan: 4 }
				},

				{
					id: "firstName",
					header: "First Name",
					width: 100,
					flexgrow: 1
				},
				{ id: "lastName", header: "Last Name", width: 100, flexgrow: 1 },
				{
					id: "city",
					header: "City",
					width: 100,
					flexgrow: 1,
					hidden: true
				},
				{ id: "user", header: "User ID", width: 100, hidden: true },
				{ id: "email", header: "Email", width: 100, hidden: true },
				{
					id: "date",
					header: "Date",
					width: 100,
					footer: { text: data.length, css: "right" },
					hidden: true
				}
			],
			sizes: {
				rowHeight: 50,
				columnWidth: 200,
				headerHeight: 50,
				footerHeight: 50
			}
		}
	};

	let api = $.state(void 0);
	const widths = ["100%", "1000px", "600px"];
	let index = $.state(0);

	let next = $.derived(() => {
		let i = $.get(index) + 1;

		if (i == widths.length) i = 0;

		return i;
	});

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	Button(node, {
		type: 'primary',
		class: 'btn-change-width',
		onclick: () => $.set(index, $.get(next), true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Change width to ${widths[$.get(next)] ?? ''}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	HeaderMenu(node_1, {
		get api() {
			return $.get(api);
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_2 = $.child(div_1);

			$.bind_this(
				Grid(node_2, {
					get data() {
						return data;
					},

					get columns() {
						return columns;
					},

					get responsive() {
						return responsive;
					},
					footer: true
				}),
				($$value) => $.set(api, $$value, true),
				() => $.get(api)
			);

			$.reset(div_1);
			$.template_effect(() => $.set_style(div_1, `width: ${widths[$.get(index)]}; margin-top:10px;`));
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}