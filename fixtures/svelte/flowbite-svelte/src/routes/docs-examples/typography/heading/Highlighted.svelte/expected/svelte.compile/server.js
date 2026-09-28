import * as $ from 'svelte/internal/server';
import { Heading, P, Span } from "flowbite-svelte";

export default function Highlighted($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		class: 'mb-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get back to growth with `);

			Span($$renderer, {
				highlight: 'blue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->the world's #1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> CRM.`);
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