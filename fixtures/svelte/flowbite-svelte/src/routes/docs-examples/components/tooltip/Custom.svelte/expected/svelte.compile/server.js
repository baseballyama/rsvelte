import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";

export default function Custom($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Yellow tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		color: 'yellow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom type`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		placement: 'right',
		type: 'custom',
		class: 'border-none bg-purple-500 p-4 text-lg font-medium text-gray-100 dark:bg-purple-600',
		arrow: false,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}