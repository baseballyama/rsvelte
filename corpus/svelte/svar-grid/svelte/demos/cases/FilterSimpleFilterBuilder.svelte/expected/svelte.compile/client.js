import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FilterBuilder, createArrayFilter, getOptions } from "@svar-ui/svelte-filter";
import { getData } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div style="padding: 20px;"><h4>Filter data before parsing to Grid</h4> <!> <!></div>`);

export default function FilterSimpleFilterBuilder($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();

	let options = {
		city: getOptions(data, "city"),
		firstName: getOptions(data, "firstName"),
		lastName: getOptions(data, "lastName"),
		email: getOptions(data, "email")
	};

	let fields = [
		{ id: "city", label: "City", type: "text" },
		{ id: "firstName", label: "First Name", type: "text" },
		{ id: "lastName", label: "Last Name", type: "text" },
		{ id: "email", label: "Email", type: "text" }
	];

	const value = {
		rules: [{ field: "firstName", filter: "contains", value: "C" }]
	};

	let filteredData = $.state($.proxy([]));

	applyFilter(value);

	function applyFilter(value) {
		$.set(filteredData, createArrayFilter(value)(data), true);
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	FilterBuilder(node, {
		get value() {
			return value;
		},
		type: "simple",
		get fields() {
			return fields;
		},

		get options() {
			return options;
		},
		onchange: (ev) => applyFilter(ev.value)
	});

	var node_1 = $.sibling(node, 2);

	Grid(node_1, {
		get data() {
			return $.get(filteredData);
		},

		get columns() {
			return columns;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}