import * as $ from 'svelte/internal/server';
import { Alert, Button } from "flowbite-svelte";
import { InfoCircleSolid, EyeSolid } from "flowbite-svelte-icons";

export default function AdditionalContent($$renderer) {
	Alert($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-3">`);
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="text-lg font-medium">This is a info alert</span></div> <p class="mt-2 mb-4 text-sm">More info about this info alert goes here. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p> <div class="flex gap-2">`);

			Button($$renderer, {
				size: 'xs',
				children: ($$renderer) => {
					EyeSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!---->View more`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				outline: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Go to Home`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Alert($$renderer, {
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-3">`);
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="text-lg font-medium">This is a info alert</span></div> <p class="mt-2 mb-4 text-sm">More info about this info alert goes here. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p> <div class="flex gap-2">`);

			Button($$renderer, {
				size: 'xs',
				color: 'green',
				children: ($$renderer) => {
					EyeSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!---->View more`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				outline: true,
				color: 'green',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Go to Home`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}