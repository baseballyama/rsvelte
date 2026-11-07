import * as $ from 'svelte/internal/server';
import { SpeedDial, SpeedDialTrigger, Listgroup, ListgroupItem } from "flowbite-svelte";

import {
	DotsHorizontalOutline,
	DotsVerticalOutline,
	ShareNodesSolid,
	PrinterSolid,
	DownloadSolid,
	FileCopySolid
} from "flowbite-svelte-icons";

export default function Dropdown($$renderer) {
	{
		function icon($$renderer) {
			DotsHorizontalOutline($$renderer, { class: 'h-8 w-8' });
		}

		SpeedDialTrigger($$renderer, {
			class: 'absolute end-24 bottom-6',
			icon,
			$$slots: { icon: true }
		});
	}

	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		tooltip: 'none',
		placement: 'top-end',
		children: ($$renderer) => {
			Listgroup($$renderer, {
				class: 'divide-none',
				active: true,
				children: ($$renderer) => {
					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							ShareNodesSolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Share`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							PrinterSolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Print`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							DownloadSolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Save`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							FileCopySolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Copy`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			DotsVerticalOutline($$renderer, { class: 'h-8 w-8' });
		}

		SpeedDialTrigger($$renderer, {
			class: 'absolute end-6 bottom-6',
			icon,
			$$slots: { icon: true }
		});
	}

	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		tooltip: 'none',
		pill: false,
		placement: 'top-end',
		children: ($$renderer) => {
			Listgroup($$renderer, {
				class: 'divide-none',
				active: true,
				children: ($$renderer) => {
					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							ShareNodesSolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Share`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							PrinterSolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Print`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							DownloadSolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Save`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex gap-2 md:px-5',
						children: ($$renderer) => {
							FileCopySolid($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----> Copy`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}