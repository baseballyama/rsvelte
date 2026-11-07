import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Link, SearchMenu, SearchMenuGroup, SearchMenuItem } from "carbon-components-svelte";
import Catalog from "carbon-icons-svelte/lib/Catalog.svelte";
import DataBase from "carbon-icons-svelte/lib/DataBase.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function SizeExtraLarge($$anchor) {
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

	SearchMenu($$anchor, {
		size: 'xl',
		labelText: 'Search',
		placeholder: 'Search...',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SearchMenuGroup(node, {
				label: 'Resource results',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => resources, (item) => item.id, ($$anchor, item) => {
						SearchMenuItem($$anchor, {
							get text() {
								return $.get(item).name;
							},

							get value() {
								return $.get(item).id;
							},

							get icon() {
								return $.get(item).icon;
							},
							href: '#resource'
						});
					});

					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					action: ($$anchor, $$slotProps) => {
						Link($$anchor, {
							slot: 'action',
							href: '#resources',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('View all');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_2 = $.sibling(node, 2);

			SearchMenuGroup(node_2, {
				label: 'Catalog results',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_3 = $.first_child(fragment_5);

					$.each(node_3, 17, () => catalog, (item) => item.id, ($$anchor, item) => {
						SearchMenuItem($$anchor, {
							get text() {
								return $.get(item).name;
							},

							get value() {
								return $.get(item).id;
							},

							get icon() {
								return $.get(item).icon;
							},
							href: '#catalog'
						});
					});

					$.append($$anchor, fragment_5);
				},

				$$slots: {
					default: true,
					action: ($$anchor, $$slotProps) => {
						Link($$anchor, {
							slot: 'action',
							href: '#catalog',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('View all');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_4 = $.sibling(node_2, 2);

			SearchMenuGroup(node_4, {
				divider: true,
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => `Search "${value}" in Docs`);

						SearchMenuItem($$anchor, {
							persistent: true,
							get iconRight() {
								return Launch;
							},
							href: '#docs',
							get text() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}