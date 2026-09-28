import * as $ from 'svelte/internal/server';
import { Heading, Secondary } from "flowbite-svelte";

export default function Secondary_1($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		class: 'text-5xl font-extrabold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite `);

			Secondary($$renderer, {
				class: 'ms-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is secondary text`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}