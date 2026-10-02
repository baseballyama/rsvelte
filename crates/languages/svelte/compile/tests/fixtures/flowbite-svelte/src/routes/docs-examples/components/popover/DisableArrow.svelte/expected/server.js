import * as $ from 'svelte/internal/server';
import { Popover, Button } from "flowbite-svelte";

export default function DisableArrow($$renderer) {
	Button($$renderer, {
		id: 'arrow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		arrow: false,
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		triggeredBy: '#arrow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}