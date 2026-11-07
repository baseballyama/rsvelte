import * as $ from 'svelte/internal/server';
import { Heading, P, Mark } from "flowbite-svelte";

export default function Mark_1($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		class: 'mb-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Regain `);

			Mark($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->control`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> over your days`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}