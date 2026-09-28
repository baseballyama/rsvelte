import * as $ from 'svelte/internal/server';
import { Collapsible } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";

export default function Collapsible_demo($$renderer) {
	if (Collapsible.Root) {
		$$renderer.push('<!--[-->');

		Collapsible.Root($$renderer, {
			class: 'w-[327px] space-y-3',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-between space-x-10"><h4 class="text-[15px] font-medium">@huntabyte starred 3 repositories</h4> `);

				if (Collapsible.Trigger) {
					$$renderer.push('<!--[-->');

					Collapsible.Trigger($$renderer, {
						class: 'rounded-9px border-border-input bg-background-alt text-foreground shadow-btn hover:bg-muted inline-flex h-10 w-10 items-center justify-center border transition-all active:scale-[0.98]',
						'aria-label': 'Show starred repositories',
						children: ($$renderer) => {
							CaretUpDown($$renderer, { class: 'size-4', weight: 'bold' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> `);

				if (Collapsible.Content) {
					$$renderer.push('<!--[-->');

					Collapsible.Content($$renderer, {
						hiddenUntilFound: true,
						class: 'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up space-y-2 overflow-hidden font-mono text-[15px] tracking-[0.01em]',
						children: ($$renderer) => {
							$$renderer.push(`<div class="rounded-9px bg-muted inline-flex h-12 w-full items-center px-[18px] py-3">@huntabyte/bits-ui</div> <div class="rounded-9px bg-muted inline-flex h-12 w-full items-center px-[18px] py-3">@huntabyte/shadcn-svelte</div> <div class="rounded-9px bg-muted inline-flex h-12 w-full items-center px-[18px] py-3">@svecosystem/runed</div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}