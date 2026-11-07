import * as $ from 'svelte/internal/server';
import { Undo02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/svelte";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Reset_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { submenu = false } = $$props;
		const designSystem = useDesignSystem();

		if (submenu) {
			$$renderer.push('<!--[0-->');

			if (DropdownMenu.Item) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Item($$renderer, {
					onSelect: designSystem.reset,
					closeOnSelect: false,
					class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Reset</div> <div class="text-sm font-medium text-foreground">Start Over</div></div> `);

						if (Kbd.Group) {
							$$renderer.push('<!--[-->');

							Kbd.Group($$renderer, {
								children: ($$renderer) => {
									if (Kbd.Root) {
										$$renderer.push('<!--[-->');

										Kbd.Root($$renderer, {
											class: 'hidden bg-foreground/10 text-foreground md:flex',
											children: ($$renderer) => {
												$$renderer.push(`<!---->⇧`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

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
				variant: 'ghost',
				size: 'sm',
				onclick: designSystem.reset,
				class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Reset</div> <div class="text-sm font-medium text-foreground">Start Over</div></div> `);
					HugeiconsIcon($$renderer, { icon: Undo02Icon, className: '-translate-x-0.5' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}