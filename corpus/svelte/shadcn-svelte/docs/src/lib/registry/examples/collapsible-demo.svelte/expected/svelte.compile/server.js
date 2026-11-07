import * as $ from 'svelte/internal/server';
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Collapsible_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Collapsible.Root) {
			$$renderer.push('<!--[-->');

			Collapsible.Root($$renderer, {
				class: 'w-[350px] space-y-2',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center justify-between space-x-4 px-4"><h4 class="text-sm font-semibold">@huntabyte starred 3 repositories</h4> `);

					if (Collapsible.Trigger) {
						$$renderer.push('<!--[-->');

						Collapsible.Trigger($$renderer, {
							class: buttonVariants({ variant: "ghost", size: "sm", class: "w-9 p-0" }),
							children: ($$renderer) => {
								ChevronsUpDownIcon($$renderer, {});
								$$renderer.push(`<!----> <span class="sr-only">Toggle</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="rounded-md border px-4 py-3 font-mono text-sm">@huntabyte/bits-ui</div> `);

					if (Collapsible.Content) {
						$$renderer.push('<!--[-->');

						Collapsible.Content($$renderer, {
							class: 'space-y-2',
							children: ($$renderer) => {
								$$renderer.push(`<div class="rounded-md border px-4 py-3 font-mono text-sm">@melt-ui/melt-ui</div> <div class="rounded-md border px-4 py-3 font-mono text-sm">@sveltejs/svelte</div>`);
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
	});
}