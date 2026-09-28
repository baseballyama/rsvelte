import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";
import { Button } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="demo-container svelte-ygh8xg"><div><h4>Custom sorting function can be specified in columns config</h4> <!></div> <div><h4>Sorting via sort-rows action call</h4> <!> <!></div></div>`);

export default function SortCustom($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();
	let api = $.state(void 0);

	const columnsCustomSort = [
		{ id: "id", width: 50, sort: true },
		{ id: "city", header: "City", width: 160, sort: true },
		{
			id: "street",
			header: "Street",
			width: 200,
			sort: (a, b) => {
				return a.zipCode.localeCompare(b.zipCode);
			},
			template: (value, row) => `${row.street}, ${row.zipCode}`
		},
		{ id: "firstName", header: "First Name", sort: true },
		{ id: "lastName", header: "Last Name", sort: true }
	];

	const columnsSort = [
		{ id: "id", width: 50, sort: false },
		{ id: "city", header: "City", width: 160, sort: true },
		{ id: "firstName", header: "First Name", sort: true },
		{ id: "lastName", header: "Last Name", sort: true }
	];

	let sortMarks = $.state(void 0);

	function onclick() {
		$.set(
			sortMarks,
			{
				lastName: {
					order: $.get(sortMarks)?.lastName?.order === "asc" ? "desc" : "asc"
				}
			},
			true
		);

		$.get(api).exec("sort-rows", {
			sort: (a, b) => {
				return $.get(sortMarks)?.lastName?.order === "asc"
					? a.lastName.localeCompare(b.lastName)
					: -a.lastName.localeCompare(b.lastName);
			}
		});
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Grid(node, {
		get data() {
			return data;
		},

		get columns() {
			return columnsCustomSort;
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2), 2);

	Button(node_1, {
		onclick,
		css: 'demo-button-sort',
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Click to sort by last name');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.bind_this(
		Grid(node_2, {
			get data() {
				return data;
			},

			get sortMarks() {
				return $.get(sortMarks);
			},

			get columns() {
				return columnsSort;
			}
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}