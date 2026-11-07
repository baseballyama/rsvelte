import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SvelteTable from "../src/SvelteTable.svelte";
import { generateFilter } from "./helper.js";
import faker from "faker";

var root = $.from_html(
	`<div class="card svelte-15hlp8y" style="width: 100%; margin:8px auto;"><div class="card-body svelte-15hlp8y"><p class="card-text">This search example uses <code>searchValue</code> for both first and last name
      fields</p> <p class="card-text">The first name field uses a <strong>single parameter</strong> searchValue
      function which returns a <code>string</code>. The search logic is handled
      by SvelteTable. <strong>This functionality will likely be deprecated in the future.</strong></p> <p class="card-text">The last name field uses a <strong>two parameters</strong> searchValue
      function which returns a <code>boolean</code>. This allows more
      flexibility in the search behaviour.</p></div></div> <div class="d-flex justify-content-center svelte-15hlp8y" role="group"><input placeholder="First Name"/> <button class="btn btn-outline-primary">CLEAR FIRST NAME</button> <button class="btn btn-outline-primary">CLEAR LAST NAME</button> <button class="btn btn-outline-primary">CLEAR AGE</button> <button class="btn btn-outline-primary">CLEAR ALL</button> <button class="btn btn-outline-primary">Find Rosie</button></div> <!> <h2> </h2>`,
	1
);

export default function Example5($$anchor, $$props) {
	$.push($$props, true);

	// import SvelteTable from "svelte-table";
	faker.seed(15);

	let selection = { first_name: "", last_name: "b" };

	const colums = [
		{
			key: "id",
			title: "ID",
			value: (v) => v.id,
			sortable: false,
			headerClass: "text-left"
		},

		{
			key: "first_name",
			title: "FIRST NAME",
			value: (v) => v.first_name,
			sortable: true,
			searchValue: (v) => v.first_name,
			hideFilterHeader: true
		},

		{
			key: "last_name",
			title: "LAST NAME",
			value: (v) => v.last_name,
			sortable: true,
			searchValue: (v, s) => v.last_name.toString().toLowerCase().startsWith(s.toLowerCase())
		},

		{
			key: "email",
			title: "EMAIL",
			value: (v) => v.email,
			sortable: true,
			class: "text-center"
		},

		{
			key: "age",
			title: "Age",
			value: (v) => v.age,
			sortable: true,
			filterOptions: generateFilter("age")
		},

		{
			key: "pet",
			title: "Pet",
			value: (v) => v.pet,
			sortable: true,
			filterOptions: generateFilter("pet")
		},

		{
			key: "ip_address",
			title: "IP ADDRESS",
			value: (v) => v.ip_address,
			sortable: true
		}
	];

	const numRows = 50;

	const data = Array(numRows).fill("").map((n, i) => {
		let d = {
			id: i,
			first_name: faker.name.firstName(),
			last_name: faker.name.lastName(),
			pet: faker.random.number(1) ? "Dog" : "Cat",
			age: 26 + faker.random.number(37),
			ip_address: "192.168." + faker.random.number(128) + "." + faker.random.number(255)
		};

		d.email = d.first_name[0].toLowerCase() + d.last_name.toLowerCase() + "@zipit.org.ca";

		return d;
	});

	function setFilter(key, value = undefined) {
		if (selection[key] || value != undefined) {
			selection[key] = value;
		}
	}

	function clearAll() {
		selection = {};
	}

	let filteredRows = [];
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var input = $.child(div);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);

	$.reset(div);

	var node = $.sibling(div, 2);

	SvelteTable(node, {
		classNameTable: 'table',
		get columns() {
			return colums;
		},

		get rows() {
			return data;
		},

		get filterSelections() {
			return selection;
		},

		set filterSelections($$value) {
			selection = $$value;
		},

		get filteredRows() {
			return filteredRows;
		},

		set filteredRows($$value) {
			filteredRows = $$value;
		}
	});

	var h2 = $.sibling(node, 2);
	var text = $.only_child(h2);

	$.template_effect(
		($0) => {
			button.disabled = selection["first_name"] === undefined;
			button_1.disabled = selection["last_name"] === undefined;
			button_2.disabled = selection["age"] === undefined;
			button_3.disabled = $0;
			$.set_text(text, `Number of filtered rows: ${filteredRows.length ?? ''}`);
		},
		[() => !Object.values(selection).some((v) => v != undefined)]
	);

	$.bind_value(input, () => selection["first_name"], ($$value) => selection["first_name"] = $$value);
	$.event('click', button, () => setFilter("first_name"));
	$.event('click', button_1, () => setFilter("last_name"));
	$.event('click', button_2, () => setFilter("age"));
	$.event('click', button_3, () => clearAll());
	$.event('click', button_4, () => setFilter("first_name", "R") + setFilter("age", 48));
	$.append($$anchor, fragment);
	$.pop();
}