import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Editable cells: use double click to activate an editor. Use Tab, Enter
		and Esc to navigate</h4> <div><!></div></div>`);

export default function InlineEditors($$anchor, $$props) {
	$.push($$props, true);

	const { allData: data, countries, users } = getData();

	const columns = [
		{ id: "id", width: 50 },
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
		},

		{
			id: "destinations",
			header: 'Destinations - "multiselect"',
			editor: { type: "multiselect", config: { clear: true } },
			options: countries,
			width: 250
		},

		{
			id: "stars",
			header: 'Stars - "text" (number)',
			editor: { type: "text", config: { type: "number" } },
			width: 250
		}
	];

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}