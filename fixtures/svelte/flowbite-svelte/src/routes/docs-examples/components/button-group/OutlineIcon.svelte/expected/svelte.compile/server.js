import * as $ from 'svelte/internal/server';
import { ButtonGroup, Button } from "flowbite-svelte";
import { UserCircleSolid, AdjustmentsVerticalOutline, DownloadSolid } from "flowbite-svelte-icons";

export default function OutlineIcon($$renderer) {
	ButtonGroup($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				outline: true,
				color: 'dark',
				children: ($$renderer) => {
					UserCircleSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				color: 'dark',
				children: ($$renderer) => {
					AdjustmentsVerticalOutline($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				color: 'dark',
				children: ($$renderer) => {
					DownloadSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Download`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}