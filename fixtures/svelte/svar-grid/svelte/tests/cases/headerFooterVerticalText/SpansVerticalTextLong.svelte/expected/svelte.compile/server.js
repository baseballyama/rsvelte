import * as $ from 'svelte/internal/server';
import { getData } from "../../data";
import { Grid } from "../../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function SpansVerticalTextLong($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tmp = getData(), data = tmp.data;

		data.length = 5;

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: [
					{ text: "Main client info", colspan: 5 },
					{ text: "User", colspan: 2 },
					{ text: "First Name", vertical: true }
				],
				footer: [
					{ text: "Main client info", colspan: 3 },
					{ text: "User", colspan: 2 },
					{ text: "First Name", vertical: true }
				],
				width: 150
			},

			{
				id: "lastName",
				header: ["", "", { text: "Last Name", vertical: true }],
				footer: ["", "", { text: "Last Name", vertical: true }],
				width: 150
			},

			{
				id: "email",
				header: [
					"",
					{ text: "Email with long text", vertical: true, rowspan: 2 }
				],
				footer: [
					"",
					{ text: "Email with long text", vertical: true, rowspan: 2 }
				]
			},

			{
				id: "companyName",
				header: ["", { text: "Company", colspan: 2 }, { text: "Name" }],
				footer: [
					{
						text: "Company long text",
						colspan: 2,
						rowspan: 2,
						vertical: true
					},
					{ text: "Name" }
				]
			},

			{
				id: "city",
				width: 100,
				header: ["", "", "City"],
				footer: ["", "City"]
			},

			{
				id: "stars",
				header: { text: "Stars with long long text", vertical: true },
				footer: { text: "Stars with long long text", vertical: true },
				width: 50
			},

			{
				id: "date",
				template: (obj) => obj.toDateString(),
				header: "Joined",
				footer: "Joined"
			}
		];

		let api = void 0;

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo svelte-19uo3vq" style="padding: 20px;"><div style="margin-top: 20px;">`);
						Grid($$renderer, { data, columns, footer: true });
						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}