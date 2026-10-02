import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, ContextMenu, HeaderMenu } from "../../src";
import { Locale, Segmented } from "@svar-ui/svelte-core";
import { en, cn } from "@svar-ui/grid-locales";
import { en as enCore, cn as cnCore } from "@svar-ui/core-locales";

export default function Localization($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData: data, countries, users } = getData();
		let table = void 0;

		function init(api) {
			table = api;
		}

		const columns = [
			{ id: "id", width: 50 },
			{ id: "firstName", header: "Name", editor: "text", width: 180 },
			{
				id: "country",
				header: "Country",
				editor: {
					type: "combo",
					config: { template: (option) => `${option.id}. ${option.label}` }
				},
				options: countries,
				width: 180
			},

			{
				id: "date",
				header: "Date",
				width: 180,
				editor: "datepicker",
				template: (v) => v ? v.toLocaleDateString() : ""
			},

			{
				id: "user",
				header: "User",
				width: 180,
				editor: "richselect",
				options: users
			}
		];

		let language = "en";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo svelte-sl324a">`);

			Segmented($$renderer, {
				options: [
					{ id: "en", label: "English" },
					{ id: "cn", label: "Chinese" }
				],

				get value() {
					return language;
				},

				set value($$value) {
					language = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (language == "en") {
				$$renderer.push('<!--[0-->');

				Locale($$renderer, {
					words: { ...en, ...enCore },
					children: ($$renderer) => {
						ContextMenu($$renderer, {
							api: table,
							children: ($$renderer) => {
								HeaderMenu($$renderer, {
									api: table,
									children: ($$renderer) => {
										Grid($$renderer, { data, columns, init });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			} else if (language == "cn") {
				$$renderer.push('<!--[1-->');

				Locale($$renderer, {
					words: { ...cn, ...cnCore },
					children: ($$renderer) => {
						ContextMenu($$renderer, {
							api: table,
							children: ($$renderer) => {
								HeaderMenu($$renderer, {
									api: table,
									children: ($$renderer) => {
										Grid($$renderer, { data, columns, init });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}