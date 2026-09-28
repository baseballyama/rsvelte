import * as $ from 'svelte/internal/server';
import { Button, SpeedDial, SpeedDialButton, Rating } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

export default function Custom($$renderer) {
	Button($$renderer, {
		color: 'green',
		class: 'absolute end-6 bottom-6 py-0',
		children: ($$renderer) => {
			Rating($$renderer, { total: 1, rating: 0.5, size: 48 });
			$$renderer.push(`<!----> Rating`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		placement: 'top-end',
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