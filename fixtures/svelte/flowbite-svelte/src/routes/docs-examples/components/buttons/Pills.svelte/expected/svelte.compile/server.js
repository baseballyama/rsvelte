import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";

export default function Pills($$renderer) {
	Button($$renderer, {
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'alternative',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Alternative`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'dark',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dark`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'light',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Light`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'blue',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'green',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'red',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'yellow',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'purple',
		pill: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}