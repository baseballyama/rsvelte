import * as $ from 'svelte/internal/server';
import { Heading, P, Span } from "flowbite-svelte";

export default function Underline($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		class: 'mb-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->We invest in the `);

			Span($$renderer, {
				underline: true,
				class: 'decoration-blue-400 decoration-8 dark:decoration-blue-600',
				children: ($$renderer) => {
					$$renderer.push(`<!---->world’s potential`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
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