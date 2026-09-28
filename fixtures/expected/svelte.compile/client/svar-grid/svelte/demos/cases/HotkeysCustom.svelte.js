import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>You can specify your own hotkeys</h4> <p>Press ctrl+alt+n to add row, select and press Delete to delete row</p> <div><!></div></div>`);

export default function HotkeysCustom($$anchor, $$props) {
	$.push($$props, true);

	const { allData: data, countries, users } = getData();
	let api = $.state(void 0);

	const hotkeys = {
		"ctrl+alt+n": (event) => {
			event.preventDefault();
			$.get(api).exec("add-row", { row: {} });
		},

		Delete: (event) => {
			event.preventDefault();

			const id = $.get(api).getState().selectedRows[0];

			if (id) {
				$.get(api).exec("delete-row", { id });
			}
		}
	};

	const columns = [
		{
			id: "firstName",
			header: 'Name - "text"',
			editor: "text",
			width: 180
		},

		{
			id: "country",
			header: 'Country - "combo"',
			editor: {
				type: "combo",
				config: { template: (option) => `${option.id}. ${option.label}` }
			},
			options: countries,
			width: 180
		},

		{
			id: "date",
			header: 'Date - "datepicker"',
			width: 180,
			editor: "datepicker",
			template: (v) => v ? v.toLocaleDateString() : ""
		},

		{
			id: "user",
			header: 'User - "richselect"',
			width: 180,
			editor: "richselect",
			options: users
		}
	];

	var div = root();
	var div_1 = $.sibling($.child(div), 4);
	var node = $.child(div_1);

	$.bind_this(
		Grid(node, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},

			get hotkeys() {
				return hotkeys;
			}
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}