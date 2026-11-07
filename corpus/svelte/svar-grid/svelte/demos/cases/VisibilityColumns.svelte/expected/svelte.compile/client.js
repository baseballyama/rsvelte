import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, HeaderMenu } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><h4>Any column can be hidden: right-click on the header to show the menu</h4> <div><!></div> <h4>Some columns can be hidden: right-click on the header to show the menu</h4> <div><!></div></div>`);

export default function VisibilityColumns($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "city", header: "City", width: 160, hidden: true },
		{ id: "firstName", header: "First Name", flexgrow: 1 },
		{ id: "lastName", header: "Last Name", flexgrow: 1 },
		{ id: "companyName", header: "Company", flexgrow: 1 }
	];

	let api = $.state(void 0);

	const columns1 = [
		{ id: "id", width: 50 },
		{
			id: "lastName",
			header: "Last Name",
			footer: "Last Name",
			width: 150
		},
		{ id: "email", header: "Email", footer: "Email" },
		{
			id: "companyName",
			header: "Company",
			footer: "Company",
			flexgrow: 1
		},
		{ id: "city", header: "City", width: 160, hidden: true },
		{ id: "stars", header: "Stars" }
	];

	let api1 = $.state(void 0);
	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	HeaderMenu(node, {
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
						return columns;
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

	HeaderMenu(node_1, {
		columns: { city: true, stars: true },
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
						return columns1;
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