import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, Tooltip } from "../../src/";
import CustomTooltip from "../custom/CustomTooltip.svelte";

var root = $.from_html(`<div style="padding: 20px;"><h4>Default text tooltips for specific columns</h4> <p>The tooltip is only shown for cells with overflow</p> <div><!></div> <h4>Custom tooltips</h4> <div><!></div></div>`);

export default function Tooltips($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();

	const columnsTooltip = [
		{ id: "id", width: 50, tooltip: false },
		{ id: "city", width: 100, header: "City", footer: "City" },
		{
			id: "firstName",
			header: "First Name",
			footer: "First Name",
			width: 150,
			tooltip: false
		},

		{
			id: "lastName",
			header: "Last Name",
			footer: "Last Name",
			width: 150,
			tooltip: false
		},
		{ id: "email", header: "Email", footer: "Email" },
		{ id: "companyName", header: "Company", footer: "Company" },
		{ id: "stars", tooltip: false },
		{ id: "date", tooltip: (obj) => obj.date?.toDateString() }
	];

	let api = $.state(void 0);
	let api1 = $.state(void 0);
	var div = root();
	var div_1 = $.sibling($.child(div), 4);
	var node = $.child(div_1);

	Tooltip(node, {
		overflow: true,
		get api() {
			return $.get(api);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Grid($$anchor, {
					get data() {
						return data;
					},

					get columns() {
						return columnsTooltip;
					}
				}),
				($$value) => $.set(api, $$value, true),
				() => $.get(api)
			);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var node_1 = $.child(div_2);

	Tooltip(node_1, {
		get content() {
			return CustomTooltip;
		},

		get api() {
			return $.get(api1);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Grid($$anchor, {
					get data() {
						return data;
					},

					get columns() {
						return columns;
					}
				}),
				($$value) => $.set(api1, $$value, true),
				() => $.get(api1)
			);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}