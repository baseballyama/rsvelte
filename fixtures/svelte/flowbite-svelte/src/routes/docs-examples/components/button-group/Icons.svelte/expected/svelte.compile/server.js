import * as $ from 'svelte/internal/server';
import { ButtonGroup, Button } from "flowbite-svelte";
import { UserCircleSolid, AdjustmentsVerticalOutline, DownloadSolid } from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	ButtonGroup($$renderer, {
		class: '*:ring-primary-700!',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					UserCircleSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					AdjustmentsVerticalOutline($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
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