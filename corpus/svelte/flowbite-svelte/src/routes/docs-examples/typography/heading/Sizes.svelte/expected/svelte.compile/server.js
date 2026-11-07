import * as $ from 'svelte/internal/server';
import { Heading } from "flowbite-svelte";

export default function Sizes($$renderer) {
	Heading($$renderer, {
		tag: 'h1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 4`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 5`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h6',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading 6`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}