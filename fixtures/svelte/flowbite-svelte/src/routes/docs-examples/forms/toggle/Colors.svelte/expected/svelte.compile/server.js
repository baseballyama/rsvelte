import * as $ from 'svelte/internal/server';
import { Toggle } from "flowbite-svelte";

export default function Colors($$renderer) {
	Toggle($$renderer, {
		color: 'red',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		color: 'green',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		color: 'purple',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		color: 'yellow',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		color: 'teal',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Teal`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		color: 'orange',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Orange`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}