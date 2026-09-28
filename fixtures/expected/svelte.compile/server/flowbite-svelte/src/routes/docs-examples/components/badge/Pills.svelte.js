import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";

export default function Pills($$renderer) {
	Badge($$renderer, {
		rounded: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'gray',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Gray`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'yellow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'indigo',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Indigo`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'purple',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		color: 'pink',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Pink`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}