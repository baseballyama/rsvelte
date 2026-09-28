import * as $ from 'svelte/internal/server';
import { Willow, Locale, Tabs } from "@svar-ui/svelte-core";
import { FilterBar, createArrayFilter } from "@svar-ui/svelte-query";
import { Grid } from "../../src";
import { getData } from "../data";

export default function FilterBar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, columns } = getData();
		let fields = void 0;
		let cols = void 0;
		let api = void 0;

		function init(api) {
			fields = [];
			cols = api.getReactiveState().columns;

			$.store_get($$store_subs ??= {}, '$cols', cols).forEach((col) => {
				if (col.id !== "id") {
					fields.push(col.id);
				}
			});
		}

		const filteredData = $.derived(() => createArrayFilter(value)(data));
		let value = void 0;
		let filter = 1;

		let filterTabs1 = [
			{ id: 1, label: "By all" },
			{ id: 2, label: "By city" },
			{ id: 3, label: "By the field" }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Willow($$renderer, {
				children: ($$renderer) => {
					Locale($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div style="padding: 20px;">`);

							Tabs($$renderer, {
								options: filterTabs1,
								get value() {
									return filter;
								},

								set value($$value) {
									filter = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (filter === 1 && fields) {
								$$renderer.push('<!--[0-->');
								FilterBar($$renderer, { fields, onchange: (ev) => value = ev.value });
							} else if (filter === 2) {
								$$renderer.push('<!--[1-->');
								FilterBar($$renderer, { by: "city", onchange: (ev) => value = ev.value });
							} else if (filter === 3) {
								$$renderer.push('<!--[2-->');

								FilterBar($$renderer, {
									by: ':dynamic',
									fields: ["city", "firstName", "lastName", "email"],
									onchange: (ev) => value = ev.value
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);
							Grid($$renderer, { data: filteredData(), columns, init });
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}