import * as $ from 'svelte/internal/server';
import { DiceFaces05Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/svelte";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Random_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();

		if (submenu) {
			$$renderer.push('<!--[0-->');

			if (DropdownMenu.Item) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Item($$renderer, {
					onSelect: designSystem.randomize,
					closeOnSelect: false,
					class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Shuffle</div> <div class="text-sm font-medium text-foreground">Try Random</div></div> `);
						HugeiconsIcon($$renderer, { icon: DiceFaces05Icon, className: 'size-5 md:hidden' });
						$$renderer.push(`<!----> `);

						if (Kbd.Root) {
							$$renderer.push('<!--[-->');

							Kbd.Root($$renderer, {
								class: 'hidden bg-foreground/10 text-foreground md:flex',
								children: ($$renderer) => {
									$$renderer.push(`<!---->R`);
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
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, {
				variant: 'outline',
				onclick: designSystem.randomize,
				class: 'flex-1 touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! md:flex-none pointer-coarse:h-10!',
				children: ($$renderer) => {
					$$renderer.push(`<span class="w-full text-center font-medium">Shuffle</span>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}