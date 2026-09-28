import * as $ from 'svelte/internal/server';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Checkbox_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-6"><div class="flex items-center gap-3">`);
	Checkbox($$renderer, { id: 'terms' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'terms',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept terms and conditions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex items-start gap-3">`);
	Checkbox($$renderer, { id: 'terms-2', checked: true });
	$$renderer.push(`<!----> <div class="grid gap-2">`);

	Label($$renderer, {
		for: 'terms-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept terms and conditions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="text-sm text-muted-foreground">By clicking this checkbox, you agree to the terms and conditions.</p></div></div> <div class="flex items-start gap-3">`);
	Checkbox($$renderer, { id: 'toggle', disabled: true });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'toggle',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Enable notifications`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Label($$renderer, {
		class: 'flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950',
		children: ($$renderer) => {
			Checkbox($$renderer, {
				id: 'toggle-2',
				checked: true,
				class: 'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
			});

			$$renderer.push(`<!----> <div class="grid gap-1.5 font-normal"><p class="text-sm leading-none font-medium">Enable notifications</p> <p class="text-sm text-muted-foreground">You can enable or disable notifications at any time.</p></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}