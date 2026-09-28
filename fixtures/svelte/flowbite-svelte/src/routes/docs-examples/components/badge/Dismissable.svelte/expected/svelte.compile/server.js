import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";

export default function Dismissable($$renderer) {
	Badge($$renderer, {
		dismissable: true,
		large: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'gray',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Gray`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'yellow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'indigo',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Indigo`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'purple',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		dismissable: true,
		large: true,
		color: 'pink',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Pink`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}