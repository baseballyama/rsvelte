import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function TextJustify($$renderer) {
	P($$renderer, {
		justify: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind
  CSS and based on the Flowbite component library`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind
  CSS and based on the Flowbite component library`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}