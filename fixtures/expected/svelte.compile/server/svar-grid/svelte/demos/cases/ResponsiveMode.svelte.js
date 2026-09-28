import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Button } from "@svar-ui/svelte-core";
import { Grid, HeaderMenu } from "../../src/";

export default function ResponsiveMode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", footer: { text: "All users", colspan: 6 } },
			{ id: "firstName", header: "First Name", flexgrow: 1 },
			{ id: "lastName", header: "Last Name" },
			{ id: "city", header: "City" },
			{ id: "user", header: "User ID" },
			{ id: "email", header: "Email" },
			{
				id: "date",
				header: "Date",
				footer: { text: data.length, css: "right" }
			}
		];

		const responsive = {
			"1000": {
				columns: [
					{
						id: "id",
						footer: { text: "All users", colspan: 6 },
						flexgrow: 1
					},
					{ id: "firstName", header: "First Name", flexgrow: 1 },
					{ id: "lastName", header: "Last Name", flexgrow: 1 },
					{ id: "city", header: "City", hidden: true, flexgrow: 1 },
					{ id: "user", header: "User ID", flexgrow: 1 },
					{ id: "email", header: "Email", hidden: true, flexgrow: 1 },
					{
						id: "date",
						header: "Date",
						footer: { text: data.length, css: "right" },
						flexgrow: 1
					}
				],
				sizes: {
					rowHeight: 40,
					columnWidth: 160,
					headerHeight: 40,
					footerHeight: 40
				}
			},
			"600": {
				columns: [
					{
						id: "id",
						width: 50,
						footer: { text: "All users", colspan: 4 }
					},

					{
						id: "firstName",
						header: "First Name",
						width: 100,
						flexgrow: 1
					},
					{ id: "lastName", header: "Last Name", width: 100, flexgrow: 1 },
					{
						id: "city",
						header: "City",
						width: 100,
						flexgrow: 1,
						hidden: true
					},
					{ id: "user", header: "User ID", width: 100, hidden: true },
					{ id: "email", header: "Email", width: 100, hidden: true },
					{
						id: "date",
						header: "Date",
						width: 100,
						footer: { text: data.length, css: "right" },
						hidden: true
					}
				],
				sizes: {
					rowHeight: 50,
					columnWidth: 200,
					headerHeight: 50,
					footerHeight: 50
				}
			}
		};

		let api = void 0;
		const widths = ["100%", "1000px", "600px"];
		let index = 0;

		let next = $.derived(() => {
			let i = index + 1;

			if (i == widths.length) i = 0;

			return i;
		});

		$$renderer.push(`<div class="demo svelte-cd1n12"><h4>DataGrid can have different settings for different container width</h4> `);

		Button($$renderer, {
			type: 'primary',
			class: 'btn-change-width',
			onclick: () => index = next(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Change width to ${$.escape(widths[next()])}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		HeaderMenu($$renderer, {
			api,
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_style(`width: ${widths[index]}; margin-top:10px;`)}>`);
				Grid($$renderer, { data, columns, responsive, footer: true });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}