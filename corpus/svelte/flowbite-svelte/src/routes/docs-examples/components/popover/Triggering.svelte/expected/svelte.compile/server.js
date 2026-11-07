import * as $ from 'svelte/internal/server';
import { Popover, Button } from "flowbite-svelte";

export default function Triggering($$renderer) {
	Button($$renderer, {
		id: 'hover',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hover popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'click',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Click popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-64 text-sm font-light ',
		title: 'Popover title',
		triggeredBy: '#hover',
		trigger: 'hover',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-64 text-sm font-light ',
		title: 'Popover title',
		triggeredBy: '#click',
		trigger: 'click',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}