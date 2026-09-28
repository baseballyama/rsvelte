import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SvelteTable from "../src/SvelteTable.svelte";

var root = $.from_html(`<div class="container"><h1>SvelteTable example 8 ~ dynamic column classes</h1> <div class="row"><!></div></div> <div class="container"><h1>SvelteTable example 8 ~ dynamic row class</h1> <div class="row"><!></div></div>`, 1);

export default function Example8($$anchor, $$props) {
	$.push($$props, true);
	globalThis.faker.seed(5);

	const classNameRow = (v, rowIndex) => rowIndex % 2 == 0 ? null : "row-odd";

	const generateData = (numRows) => {
		return Array(numRows).fill("").map((n, i) => {
			let d = {
				id: i,
				first_name: globalThis.faker.name.firstName() + "",
				last_name: globalThis.faker.name.lastName() + "",
				county: globalThis.faker.address.county() + "",
				state: globalThis.faker.address.state() + "",
				country: globalThis.faker.address.country() + "",
				email: ""
			};

			// update email
			d.email = d.first_name[0].toLowerCase() + d.last_name.toLowerCase() + "@zipit.org.ca";

			return d;
		});
	};

	const data1 = generateData(9);
	const data2 = generateData(9);

	const cols1 = [
		{
			key: "id",
			title: "ID",
			value: (v) => v.id,
			sortable: true,
			class: (v, r, c) => v.id % 2 == 1 ? null : "cell"
		},

		{
			key: "first_name",
			title: "FIRST NAME",
			value: (v) => v.first_name,
			sortable: true
		},

		{
			key: "last_name",
			title: "LAST NAME",
			value: (v) => v.last_name,
			sortable: true
		},

		{
			key: "email",
			title: "EMAIL (rowIndex)",
			value: (v) => v.email,
			sortable: true,
			class: (v, r, c) => r % 2 == 1 ? null : "cell"
		}
	];

	const cols2 = [
		{ key: "id", title: "ID", value: (v) => v.id, sortable: true },
		{
			key: "first_name",
			title: "FIRST NAME",
			value: (v) => v.first_name,
			sortable: true
		},

		{
			key: "last_name",
			title: "LAST NAME",
			value: (v) => v.last_name,
			sortable: true
		},

		{
			key: "email",
			title: "EMAIL (rowIndex)",
			value: (v) => v.email,
			sortable: true
		}
	];

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	SvelteTable(node, {
		get columns() {
			return cols1;
		},

		get rows() {
			return data1;
		},
		classNameTable: 'table table1',
		classNameThead: 'table-primary',
		sortBy: 'first_name'
	});

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_1 = $.child(div_3);

	SvelteTable(node_1, {
		get columns() {
			return cols2;
		},

		get rows() {
			return data2;
		},
		classNameTable: 'table table2',
		classNameThead: 'table-primary',
		classNameRow
	});

	$.reset(div_3);
	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}