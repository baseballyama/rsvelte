import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, Toolbar } from "../../src";

var root = $.from_html(`<div style="padding: 20px;"><!> <!></div>`);

export default function Toolbar_1($$anchor, $$props) {
	$.push($$props, true);

	const { data, countries } = getData();
	let api = $.state(void 0);

	const columns = [
		{ id: "id", width: 50 },
		{
			id: "firstName",
			header: "First Name",
			editor: "text",
			width: 160
		},

		{
			id: "lastName",
			header: "Last Name",
			editor: "text",
			width: 160
		},

		{
			id: "country",
			header: "Country",
			editor: "richselect",
			options: countries,
			width: 160
		},

		{
			id: "date",
			header: "Date",
			width: 100,
			template: (v) => v ? v.toLocaleDateString() : ""
		},
		{ id: "companyName", header: "Description", flexgrow: 1 }
	];

	var div = root();
	var node = $.child(div);

	Toolbar(node, {
		get api() {
			return $.get(api);
		}
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		Grid(node_1, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			reorder: true,
			undo: true,
			multiselect: true
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}