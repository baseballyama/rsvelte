import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function DefaultSearchMenu($$anchor) {
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

	SearchMenu($$anchor, {
		labelText: 'Search',
		placeholder: 'Search...',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => resources, (resource) => resource.id, ($$anchor, resource) => {
				SearchMenuItem($$anchor, {
					get text() {
						return $.get(resource).name;
					},

					get value() {
						return $.get(resource).id;
					},
					$$events: { select: (e) => console.log("select", e.detail) }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}