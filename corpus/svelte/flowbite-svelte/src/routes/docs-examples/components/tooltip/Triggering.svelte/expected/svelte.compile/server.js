import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";

export default function Triggering($$renderer) {
	Button($$renderer, {
		id: 'hover',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip hover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'click',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip click`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggeredBy: '#hover',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hover tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		trigger: 'click',
		triggeredBy: '#click',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Click tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}