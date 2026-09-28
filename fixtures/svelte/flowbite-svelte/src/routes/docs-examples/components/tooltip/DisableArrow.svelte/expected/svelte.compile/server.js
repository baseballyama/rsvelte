import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";

export default function DisableArrow($$renderer) {
	Button($$renderer, {
		id: 'disable-arrow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		arrow: false,
		triggeredBy: '#disable-arrow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}