import * as $ from 'svelte/internal/server';
import { Heading, P, Span } from "flowbite-svelte";

export default function Gradient($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		class: 'mb-4 text-3xl font-extrabold  md:text-5xl lg:text-6xl',
		children: ($$renderer) => {
			Span($$renderer, {
				gradient: 'tealToLime',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Better Data`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> Scalable AI.`);
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