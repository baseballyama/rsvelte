import * as $ from 'svelte/internal/server';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

export default function Alignment($$renderer) {
	const placements = [
		["start-2 top-2", "right", "bottom"],
		["end-6 top-2", "bottom", "left"],
		["end-6 bottom-6", "left", "top"],
		["start-2 bottom-6", "top", "right"]
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(placements);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [position, placement, tooltip] = each_array[$$index];

		SpeedDialTrigger($$renderer, { class: `absolute ${$.stringify(position)}` });
		$$renderer.push(`<!----> `);

		SpeedDial($$renderer, {
			placement,
			children: ($$renderer) => {
				SpeedDialButton($$renderer, {
					name: 'Share',
					tooltip,
					children: ($$renderer) => {
						ShareNodesSolid($$renderer, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SpeedDialButton($$renderer, {
					name: 'Print',
					tooltip,
					children: ($$renderer) => {
						PrinterSolid($$renderer, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SpeedDialButton($$renderer, {
					name: 'Download',
					tooltip,
					children: ($$renderer) => {
						DownloadSolid($$renderer, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SpeedDialButton($$renderer, {
					name: 'Copy',
					tooltip,
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

	$$renderer.push(`<!--]-->`);
}