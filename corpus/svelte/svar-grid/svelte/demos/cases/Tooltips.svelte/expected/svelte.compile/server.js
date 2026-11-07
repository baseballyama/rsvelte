import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, Tooltip } from "../../src/";
import CustomTooltip from "../custom/CustomTooltip.svelte";

export default function Tooltips($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();

		const columnsTooltip = [
			{ id: "id", width: 50, tooltip: false },
			{ id: "city", width: 100, header: "City", footer: "City" },
			{
				id: "firstName",
				header: "First Name",
				footer: "First Name",
				width: 150,
				tooltip: false
			},

			{
				id: "lastName",
				header: "Last Name",
				footer: "Last Name",
				width: 150,
				tooltip: false
			},
			{ id: "email", header: "Email", footer: "Email" },
			{ id: "companyName", header: "Company", footer: "Company" },
			{ id: "stars", tooltip: false },
			{ id: "date", tooltip: (obj) => obj.date?.toDateString() }
		];

		let api = void 0;
		let api1 = void 0;

		$$renderer.push(`<div style="padding: 20px;"><h4>Default text tooltips for specific columns</h4> <p>The tooltip is only shown for cells with overflow</p> <div>`);

		Tooltip($$renderer, {
			overflow: true,
			api,
			children: ($$renderer) => {
				Grid($$renderer, { data, columns: columnsTooltip });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h4>Custom tooltips</h4> <div>`);

		Tooltip($$renderer, {
			content: CustomTooltip,
			api: api1,
			children: ($$renderer) => {
				Grid($$renderer, { data, columns });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}