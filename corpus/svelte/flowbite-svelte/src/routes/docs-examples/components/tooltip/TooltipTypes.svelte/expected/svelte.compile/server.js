import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";

export default function TooltipTypes($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Light tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		type: 'light',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		type: 'auto',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dark tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		type: 'dark',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}