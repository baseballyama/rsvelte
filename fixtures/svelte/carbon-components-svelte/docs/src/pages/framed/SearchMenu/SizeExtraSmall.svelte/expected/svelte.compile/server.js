import * as $ from 'svelte/internal/server';
import { Link, SearchMenu, SearchMenuGroup, SearchMenuItem } from "carbon-components-svelte";
import Catalog from "carbon-icons-svelte/lib/Catalog.svelte";
import DataBase from "carbon-icons-svelte/lib/DataBase.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

export default function SizeExtraSmall($$renderer) {
	let value = "Data";

	const resources = [
		{
			id: "res-pg-test",
			name: "Databases for PostgreSQL-Test",
			icon: DataBase
		},

		{
			id: "res-memcache",
			name: "Data Store for Memcache",
			icon: DataBase
		}
	];

	const catalog = [
		{
			id: "cat-att-iot",
			name: "AT&T IoT Data Plans",
			icon: Catalog
		},

		{
			id: "cat-financial",
			name: "Managed Financial Data API",
			icon: Catalog
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		SearchMenu($$renderer, {
			size: 'xs',
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
				SearchMenuGroup($$renderer, {
					label: 'Resource results',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(resources);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							SearchMenuItem($$renderer, {
								text: item.name,
								value: item.id,
								icon: item.icon,
								href: '#resource'
							});
						}

						$$renderer.push(`<!--]-->`);
					},

					$$slots: {
						default: true,
						action: ($$renderer) => {
							Link($$renderer, {
								slot: 'action',
								href: '#resources',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View all`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				SearchMenuGroup($$renderer, {
					label: 'Catalog results',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(catalog);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let item = each_array_1[$$index_1];

							SearchMenuItem($$renderer, {
								text: item.name,
								value: item.id,
								icon: item.icon,
								href: '#catalog'
							});
						}

						$$renderer.push(`<!--]-->`);
					},

					$$slots: {
						default: true,
						action: ($$renderer) => {
							Link($$renderer, {
								slot: 'action',
								href: '#catalog',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View all`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				SearchMenuGroup($$renderer, {
					divider: true,
					children: ($$renderer) => {
						SearchMenuItem($$renderer, {
							persistent: true,
							iconRight: Launch,
							href: '#docs',
							text: `Search "${value}" in Docs`
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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