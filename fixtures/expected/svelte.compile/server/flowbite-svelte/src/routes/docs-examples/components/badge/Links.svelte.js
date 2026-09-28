import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";

export default function Links($$renderer) {
	Badge($$renderer, {
		href: '/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		href: '/',
		large: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		href: '/',
		border: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		href: '/',
		rounded: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}