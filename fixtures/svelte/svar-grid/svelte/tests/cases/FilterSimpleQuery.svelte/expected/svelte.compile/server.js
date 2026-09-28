import * as $ from 'svelte/internal/server';
import { getOptions } from "@svar-ui/query-store";
import { Query, createArrayFilter } from "@svar-ui/svelte-query";
import { getData } from "../data";
import { Grid } from "../../src/";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function FilterSimpleQuery($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, columns } = getData();
		let api = void 0;
		let cols = void 0;
		let options = {};
		let fields = [];

		function getLabel(col) {
			if (col.header) {
				if (typeof col.header === "string") return col.header;

				if (col.header.length) for (let i = col.header.length - 1; i >= 0; i--) {
					const text = col.header[i].text;

					if (text) return text;
					if (col.header[i] && typeof col.header[i] === "string") return col.header[i];
				} else if (col.header.text) return col.header.text;
			}

			return col.id;
		}

		let filteredData = data;

		function applyFilter(value) {
			const filter = createArrayFilter(value);

			filteredData = filter(data);
		}

		function init(api) {
			fields = [];
			cols = api.getReactiveState().columns;

			$.store_get($$store_subs ??= {}, '$cols', cols).forEach((col) => {
				if (col.id !== "id") {
					options[col.id] = getOptions(data, col.id);
					fields.push({ id: col.id, name: getLabel(col), type: "text" });
				}
			});
		}

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px;"><div><div class="query svelte-1ntpvso">`);

						Query($$renderer, {
							type: "simple",
							fields,
							options,
							onchange: (ev) => applyFilter(ev.value)
						});

						$$renderer.push(`<!----></div> `);
						Grid($$renderer, { data: filteredData, columns, init });
						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}