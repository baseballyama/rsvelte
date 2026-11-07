import * as $ from 'svelte/internal/server';
import { SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function DefaultSearchMenu($$renderer) {
	let value = "Data";

	const resources = [
		{ id: "svc-db-testsql", name: "Databases for TestSQL" },
		{ id: "svc-att-iot", name: "AT&T IoT Data Plans" },
		{ id: "svc-memcache", name: "Data Store for Memcache" },
		{
			id: "svc-hazardhub",
			name: "HazardHub Property Risk Data API"
		},
		{ id: "svc-financial", name: "Managed Financial Data API" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		SearchMenu($$renderer, {
			labelText: 'Search',
			placeholder: 'Search...',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(resources);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let resource = each_array[$$index];

					SearchMenuItem($$renderer, { text: resource.name, value: resource.id });
				}

				$$renderer.push(`<!--]-->`);
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
}