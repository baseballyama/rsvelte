import * as $ from 'svelte/internal/server';
import SvelteTable from "../src/SvelteTable.svelte";
import { generateFilter } from "./helper.js";
import faker from "faker";

export default function Example5($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="card svelte-15hlp8y" style="width: 100%; margin:8px auto;"><div class="card-body svelte-15hlp8y"><p class="card-text">This search example uses <code>searchValue</code> for both first and last name
      fields</p> <p class="card-text">The first name field uses a <strong>single parameter</strong> searchValue
      function which returns a <code>string</code>. The search logic is handled
      by SvelteTable. <strong>This functionality will likely be deprecated in the future.</strong></p> <p class="card-text">The last name field uses a <strong>two parameters</strong> searchValue
      function which returns a <code>boolean</code>. This allows more
      flexibility in the search behaviour.</p></div></div> <div class="d-flex justify-content-center svelte-15hlp8y" role="group"><input${$.attr('value', selection["first_name"])} placeholder="First Name"/> <button class="btn btn-outline-primary"${$.attr('disabled', selection["first_name"] === undefined, true)}>CLEAR FIRST NAME</button> <button class="btn btn-outline-primary"${$.attr('disabled', selection["last_name"] === undefined, true)}>CLEAR LAST NAME</button> <button class="btn btn-outline-primary"${$.attr('disabled', selection["age"] === undefined, true)}>CLEAR AGE</button> <button class="btn btn-outline-primary"${$.attr('disabled', !Object.values(selection).some((v) => v != undefined), true)}>CLEAR ALL</button> <button class="btn btn-outline-primary">Find Rosie</button></div> `);

			SvelteTable($$renderer, {
				classNameTable: 'table',
				columns: colums,
				rows: data,
				get filterSelections() {
					return selection;
				},

				set filterSelections($$value) {
					selection = $$value;
					$$settled = false;
				},

				get filteredRows() {
					return filteredRows;
				},

				set filteredRows($$value) {
					filteredRows = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h2>Number of filtered rows: ${$.escape(filteredRows.length)}</h2>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}