import * as $ from 'svelte/internal/server';
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

export default function Switch_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center space-x-2">`);
	Switch($$renderer, { id: 'airplane-mode' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'airplane-mode',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Airplane Mode`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}