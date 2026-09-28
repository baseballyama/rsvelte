import * as $ from 'svelte/internal/server';
import { Portal, BitsConfig } from "bits-ui";

export default function Portal_demo($$renderer) {
	let target = void 0;

	BitsConfig($$renderer, {
		defaultPortalTo: target,
		children: ($$renderer) => {
			$$renderer.push(`<div class="bg-background flex rounded-md border p-2"><section class="flex size-12 items-center justify-center bg-blue-200"><div class="size-8 bg-blue-400"></div> `);

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="size-12 bg-blue-600"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></section></div>`);
		},
		$$slots: { default: true }
	});
}