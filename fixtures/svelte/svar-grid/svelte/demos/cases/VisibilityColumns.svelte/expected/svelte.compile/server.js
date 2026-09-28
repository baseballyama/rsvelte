import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, HeaderMenu } from "../../src/";

export default function VisibilityColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{ id: "city", header: "City", width: 160, hidden: true },
			{ id: "firstName", header: "First Name", flexgrow: 1 },
			{ id: "lastName", header: "Last Name", flexgrow: 1 },
			{ id: "companyName", header: "Company", flexgrow: 1 }
		];

		let api = void 0;

		const columns1 = [
			{ id: "id", width: 50 },
			{
				id: "lastName",
				header: "Last Name",
				footer: "Last Name",
				width: 150
			},
			{ id: "email", header: "Email", footer: "Email" },
			{
				id: "companyName",
				header: "Company",
				footer: "Company",
				flexgrow: 1
			},
			{ id: "city", header: "City", width: 160, hidden: true },
			{ id: "stars", header: "Stars" }
		];

		let api1 = void 0;

		$$renderer.push(`<div style="padding: 20px;"><h4>Any column can be hidden: right-click on the header to show the menu</h4> <div>`);

		HeaderMenu($$renderer, {
			api,
			children: ($$renderer) => {
				Grid($$renderer, { data, columns });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h4>Some columns can be hidden: right-click on the header to show the menu</h4> <div>`);

		HeaderMenu($$renderer, {
			columns: { city: true, stars: true },
			api: api1,
			children: ($$renderer) => {
				Grid($$renderer, { data, columns: columns1 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}