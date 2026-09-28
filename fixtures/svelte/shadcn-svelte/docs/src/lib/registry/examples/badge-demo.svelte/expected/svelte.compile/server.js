import * as $ from 'svelte/internal/server';
import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col items-center gap-2"><div class="flex w-full flex-wrap gap-2">`);

	Badge($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'destructive',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Destructive`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outline`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex w-full flex-wrap gap-2">`);

	Badge($$renderer, {
		variant: 'secondary',
		class: 'bg-blue-500 text-white dark:bg-blue-600',
		children: ($$renderer) => {
			BadgeCheckIcon($$renderer, {});
			$$renderer.push(`<!----> Verified`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		class: 'h-5 min-w-5 rounded-full px-1 font-mono tabular-nums',
		children: ($$renderer) => {
			$$renderer.push(`<!---->8`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		class: 'h-5 min-w-5 rounded-full px-1 font-mono tabular-nums',
		variant: 'destructive',
		children: ($$renderer) => {
			$$renderer.push(`<!---->99`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		class: 'h-5 min-w-5 rounded-full px-1 font-mono tabular-nums',
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->20+`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}