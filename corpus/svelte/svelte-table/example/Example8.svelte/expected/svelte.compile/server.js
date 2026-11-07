import * as $ from 'svelte/internal/server';
import SvelteTable from "../src/SvelteTable.svelte";

export default function Example8($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="container"><h1>SvelteTable example 8 ~ dynamic column classes</h1> <div class="row">`);

		SvelteTable($$renderer, {
			columns: cols1,
			rows: data1,
			classNameTable: 'table table1',
			classNameThead: 'table-primary',
			sortBy: 'first_name'
		});

		$$renderer.push(`<!----></div></div> <div class="container"><h1>SvelteTable example 8 ~ dynamic row class</h1> <div class="row">`);

		SvelteTable($$renderer, {
			columns: cols2,
			rows: data2,
			classNameTable: 'table table2',
			classNameThead: 'table-primary',
			classNameRow
		});

		$$renderer.push(`<!----></div></div>`);
	});
}