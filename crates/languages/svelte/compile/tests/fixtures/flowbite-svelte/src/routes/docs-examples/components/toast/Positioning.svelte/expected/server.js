import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";

export default function Positioning($$renderer) {
	$$renderer.push(`<div class="relative h-56">`);

	Toast($$renderer, {
		dismissable: false,
		position: 'top-left',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top left positioning.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toast($$renderer, {
		dismissable: false,
		position: 'top-right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top right positioning.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toast($$renderer, {
		dismissable: false,
		position: 'bottom-left',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bottom left positioning.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toast($$renderer, {
		dismissable: false,
		position: 'bottom-right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bottom right positioning.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}