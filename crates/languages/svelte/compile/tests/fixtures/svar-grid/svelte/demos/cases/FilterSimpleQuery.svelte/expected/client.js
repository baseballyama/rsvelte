import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getOptions } from "wx-query-store";
import { Query, createArrayFilter } from "wx-svelte-query";
import { getData } from "../data";
import { Grid } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><div><div class="query svelte-u9y4qt"><!></div> <!></div></div>`);

export default function FilterSimpleQuery($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();

	let options = {
		city: getOptions(data, "city"),
		firstName: getOptions(data, "firstName"),
		lastName: getOptions(data, "lastName"),
		email: getOptions(data, "email")
	};

	let fields = [
		{ id: "city", name: "City" },
		{ id: "firstName", name: "Name" },
		{ id: "lastName", name: "Last Name" },
		{ id: "email", name: "Email" }
	];

	let filteredData = $.state($.proxy(data));

	function applyFilter(value) {
		$.set(filteredData, createArrayFilter(value)(data), true);
	}

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Query(node, {
		type: "simple",
		get fields() {
			return fields;
		},

		get options() {
			return options;
		},
		onchange: (ev) => applyFilter(ev.value)
	});

	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	Grid(node_1, {
		get data() {
			return $.get(filteredData);
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