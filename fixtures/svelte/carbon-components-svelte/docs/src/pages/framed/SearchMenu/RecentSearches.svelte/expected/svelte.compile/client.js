import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Link, SearchMenu, SearchMenuGroup, SearchMenuItem } from "carbon-components-svelte";
import Time from "carbon-icons-svelte/lib/Time.svelte";

export default function RecentSearches($$anchor) {
	let value = "";
	let searchRef = null;

	let recent = [
		{ id: "recent-vsi", query: "virtual servers" },
		{ id: "recent-starter", query: "mobile starter kits" },
		{ id: "recent-vpc", query: "vpc" },
		{ id: "recent-schematics", query: "schematics workspace" }
	];

	SearchMenu($$anchor, {
		labelText: 'Search',
		placeholder: 'Search...',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		get ref() {
			return searchRef;
		},

		set ref($$value) {
			searchRef = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SearchMenuGroup($$anchor, {
				label: 'Recent searches',
				filter: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => recent, (item) => item.id, ($$anchor, item) => {
						SearchMenuItem($$anchor, {
							get text() {
								return $.get(item).query;
							},

							get value() {
								return $.get(item).id;
							},

							get icon() {
								return Time;
							}
						});
					});

					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					action: ($$anchor, $$slotProps) => {
						Link($$anchor, {
							slot: 'action',
							href: '#',
							$$events: {
								click: (e) => {
									e.preventDefault();
									recent = [];
									searchRef?.focus();
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Clear recent searches');

								$.append($$anchor, text);
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