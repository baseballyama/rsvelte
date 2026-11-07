import * as $ from 'svelte/internal/server';
import { Listgroup, ListgroupItem, Tooltip } from "flowbite-svelte";
import { BellOutline, ClockOutline, TrashBinOutline } from "flowbite-svelte-icons";

export default function Tooltip_1($$renderer) {
	Listgroup($$renderer, {
		horizontal: true,
		active: true,
		children: ($$renderer) => {
			ListgroupItem($$renderer, {
				children: ($$renderer) => {
					BellOutline($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Tooltip bell`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ListgroupItem($$renderer, {
				children: ($$renderer) => {
					ClockOutline($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Tooltip clock`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ListgroupItem($$renderer, {
				id: 'trash',
				children: ($$renderer) => {
					TrashBinOutline($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggeredBy: '#trash',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip trash`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Listgroup($$renderer, {
		horizontal: true,
		active: true,
		children: ($$renderer) => {
			ListgroupItem($$renderer, {
				id: 'profile',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ListgroupItem($$renderer, {
				id: 'settings',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ListgroupItem($$renderer, {
				id: 'message',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggeredBy: '#profile',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip profile`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggeredBy: '#settings',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip settings`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggeredBy: '#message',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip messages`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}