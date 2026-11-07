import * as $ from 'svelte/internal/server';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

export default function TextOutside($$renderer) {
	SpeedDialTrigger($$renderer, { class: 'absolute end-24 bottom-6' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		tooltip: 'none',
		textOutside: true,
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				textClass: 'text-pink-500',
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
				name: 'Save',
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

	$$renderer.push(`<!----> `);
	SpeedDialTrigger($$renderer, { class: 'absolute end-6 bottom-6' });
	$$renderer.push(`<!----> `);

	SpeedDial($$renderer, {
		pill: false,
		tooltip: 'none',
		textOutside: true,
		children: ($$renderer) => {
			SpeedDialButton($$renderer, {
				name: 'Share',
				textClass: 'text-purple-500',
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
				name: 'Save',
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