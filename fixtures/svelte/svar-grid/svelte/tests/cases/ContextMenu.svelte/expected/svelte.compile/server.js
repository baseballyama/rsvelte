import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, ContextMenu } from "../../src/";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function ContextMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{ id: "city", header: "City", width: 160, hidden: true },
			{ id: "firstName", header: "First Name", flexgrow: 1 },
			{ id: "lastName", header: "Last Name", flexgrow: 1 },
			{ id: "companyName", header: "Company", flexgrow: 1 }
		];

		let table = void 0;

		function init(api) {
			table = api;
		}

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px;"><div>`);

						ContextMenu($$renderer, {
							api: table,
							children: ($$renderer) => {
								Grid($$renderer, { data, columns, init, reorder: true, multiselect: true });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}