import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Editable cells: different cell editors for the "Value" column</h4> <div><!></div></div>`);

export default function InlineEditorsHandler($$anchor, $$props) {
	$.push($$props, true);

	const { data, countries } = getData();

	const properties = {
		firstName: "text",
		lastName: "text",
		id: null,
		email: "text",
		companyName: "text",
		country: {
			type: "combo",
			config: { template: (option) => option.label, options: countries }
		},
		date: "datepicker",
		city: "text",
		street: "text",
		address: "text",
		zipCode: "text",
		followers: "text",
		stars: "text",
		phone: "text",
		details: "text"
	};

	const row = data[0];
	const userData = Object.keys(properties).map((key) => ({ id: key, property: key, value: row[key] }));

	const columns = [
		{ id: "property", header: "Property", width: 200 },
		{
			id: "value",
			header: "Value",
			width: 270,
			editor: (row) => properties[row.id],
			template: (v, row) => {
				if (row.id === "country") return countries.find((c) => c.id === v).label || v;

				return v instanceof Date ? v.toLocaleDateString() : v;
			}
		}
	];

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Grid(node, {
		get data() {
			return userData;
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