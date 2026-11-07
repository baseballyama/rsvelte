import * as $ from 'svelte/internal/server';
import { Link, SearchMenu, SearchMenuGroup, SearchMenuItem } from "carbon-components-svelte";
import Time from "carbon-icons-svelte/lib/Time.svelte";

export default function RecentSearches($$renderer) {
	let value = "";
	let searchRef = null;

	let recent = [
		{ id: "recent-vsi", query: "virtual servers" },
		{ id: "recent-starter", query: "mobile starter kits" },
		{ id: "recent-vpc", query: "vpc" },
		{ id: "recent-schematics", query: "schematics workspace" }
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

			get ref() {
				return searchRef;
			},

			set ref($$value) {
				searchRef = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				SearchMenuGroup($$renderer, {
					label: 'Recent searches',
					filter: false,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(recent);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							SearchMenuItem($$renderer, { text: item.query, value: item.id, icon: Time });
						}

						$$renderer.push(`<!--]-->`);
					},

					$$slots: {
						default: true,
						action: ($$renderer) => {
							Link($$renderer, {
								slot: 'action',
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Clear recent searches`);
								},
								$$slots: { default: true }
							});
						}
					}
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
}