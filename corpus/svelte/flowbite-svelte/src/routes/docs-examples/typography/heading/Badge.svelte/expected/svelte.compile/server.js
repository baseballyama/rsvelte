import * as $ from 'svelte/internal/server';
import { Heading, Badge } from "flowbite-svelte";

export default function Badge_1($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		class: 'flex items-center text-5xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite `);

			Badge($$renderer, {
				class: 'ms-2 text-2xl font-semibold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->PRO`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}