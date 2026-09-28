import * as $ from 'svelte/internal/server';
import { SpeedDial, SpeedDialTrigger, Listgroup, ListgroupItem } from "flowbite-svelte";

import {
	PenSolid,
	ShareNodesSolid,
	PrinterSolid,
	DownloadSolid,
	FileCopySolid
} from "flowbite-svelte-icons";

export default function Alternative($$renderer) {
	{
		function icon($$renderer) {
			PenSolid($$renderer, { class: 'h-8 w-8' });
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
				active: true,
				children: ($$renderer) => {
					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							ShareNodesSolid($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Share`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							PrinterSolid($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Print`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							DownloadSolid($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Save`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							FileCopySolid($$renderer, { class: 'me-2 h-5 w-5' });
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
	SpeedDialTrigger($$renderer, { class: 'absolute end-6 bottom-6' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		tooltip: 'none',
		pill: false,
		placement: 'top-end',
		children: ($$renderer) => {
			Listgroup($$renderer, {
				active: true,
				children: ($$renderer) => {
					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							ShareNodesSolid($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Share`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							PrinterSolid($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Print`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							DownloadSolid($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Save`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListgroupItem($$renderer, {
						class: 'flex',
						children: ($$renderer) => {
							FileCopySolid($$renderer, { class: 'me-2 h-5 w-5' });
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