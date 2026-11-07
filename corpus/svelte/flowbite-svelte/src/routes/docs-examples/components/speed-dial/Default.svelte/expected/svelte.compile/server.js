import * as $ from 'svelte/internal/server';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	SpeedDialTrigger($$renderer, { class: 'absolute end-6 bottom-6' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				children: ($$renderer) => {
					ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SpeedDialButton($$renderer, {
				name: 'Print',
				children: ($$renderer) => {
					PrinterSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SpeedDialButton($$renderer, {
				name: 'Download',
				children: ($$renderer) => {
					DownloadSolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SpeedDialButton($$renderer, {
				name: 'Copy',
				children: ($$renderer) => {
					FileCopySolid($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}