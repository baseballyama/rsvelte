import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FilterBuilder, createFilter, getOptions } from "@svar-ui/svelte-filter";
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div style="padding: 20px;"><h4>Filter grid data executing "filter-rows" action</h4> <!> <!></div>`);

export default function FilterBuilder_1($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();

	columns.push({ id: "comments", flexgrow: 1, header: "Comments" });

	const value = {
		glue: "or",
		rules: [
			{ field: "city", filter: "equal", value: "Eulaliabury" },
			{ field: "city", filter: "equal", value: "West Meda" }
		]
	};

	let api = $.state(void 0);

	let options = {
		city: getOptions(data, "city"),
		firstName: getOptions(data, "firstName"),
		lastName: getOptions(data, "lastName"),
		email: getOptions(data, "email")
	};

	let fields = [
		{ id: "city", label: "City", type: "text" },
		{ id: "firstName", label: "Name", type: "text" },
		{ id: "lastName", label: "Last Name", type: "text" },
		{ id: "email", label: "Email", type: "text" }
	];

	function applyFilter({ value }) {
		const filter = createFilter(value);

		$.get(api).exec("filter-rows", { filter });
	}

	$.user_effect(() => {
		if ($.get(api)) applyFilter({ value });
	});

	var div = root();
	var node = $.sibling($.child(div), 2);

	FilterBuilder(node, {
		get value() {
			return value;
		},

		get fields() {
			return fields;
		},

		get options() {
			return options;
		},
		type: "line",
		onchange: applyFilter
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		Grid(node_1, {
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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}