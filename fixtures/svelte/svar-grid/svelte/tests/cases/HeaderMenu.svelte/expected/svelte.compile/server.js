import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, HeaderMenu } from "../../src/";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function HeaderMenu_1($$renderer, $$props) {
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

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px;"><div>`);

						HeaderMenu($$renderer, {
							columns: { city: true, firstName: true, id: true },
							api,
							children: ($$renderer) => {
								Grid($$renderer, { data, columns });
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