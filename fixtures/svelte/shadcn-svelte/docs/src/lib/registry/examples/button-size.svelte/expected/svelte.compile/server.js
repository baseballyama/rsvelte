import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_size($$renderer) {
	$$renderer.push(`<div class="flex flex-col items-start gap-8 sm:flex-row"><div class="flex items-start gap-2">`);

	Button($$renderer, {
		size: 'sm',
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'icon-sm',
		'aria-label': 'Submit',
		variant: 'outline',
		children: ($$renderer) => {
			ArrowUpRightIcon($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex items-start gap-2">`);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'icon',
		'aria-label': 'Submit',
		variant: 'outline',
		children: ($$renderer) => {
			ArrowUpRightIcon($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex items-start gap-2">`);

	Button($$renderer, {
		variant: 'outline',
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'icon-lg',
		'aria-label': 'Submit',
		variant: 'outline',
		children: ($$renderer) => {
			ArrowUpRightIcon($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}