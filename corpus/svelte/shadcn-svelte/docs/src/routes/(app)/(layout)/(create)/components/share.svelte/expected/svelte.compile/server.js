import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@lucide/svelte/icons/copy";
import ShareIcon from "@lucide/svelte/icons/share";
import { scale } from "svelte/transition";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { OG_IMAGE_BASE_URL } from "$lib/../routes/og/og.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { buttonVariants, Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

export default function Share($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const designSystem = useDesignSystem();
		const clipboard = new UseClipboard();
		const ogSrc = $.derived(() => `${OG_IMAGE_BASE_URL}/create/og${new URL(designSystem.shareUrl).search}`);

		Button($$renderer, {
			variant: 'outline',
			size: 'sm',
			class: 'md:hidden',
			onclick: () => clipboard.copy(designSystem.shareUrl),
			children: ($$renderer) => {
				if (clipboard.copied) {
					$$renderer.push('<!--[0-->');
					CheckIcon($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
					ShareIcon($$renderer, {});
				}

				$$renderer.push(`<!--]--> Share`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
				children: ($$renderer) => {
					if (Popover.Trigger) {
						$$renderer.push('<!--[-->');

						Popover.Trigger($$renderer, {
							class: cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden md:flex"),
							children: ($$renderer) => {
								ShareIcon($$renderer, {});
								$$renderer.push(`<!----> Share`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Popover.Content) {
						$$renderer.push('<!--[-->');

						Popover.Content($$renderer, {
							align: 'end',
							class: 'w-96',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex w-full flex-col items-start gap-2"><div class="h-[183px] w-full overflow-hidden rounded-lg border border-border bg-background"><img${$.attr('src', ogSrc())} alt="og" class="size-full object-contain"/></div> <div class="flex w-full place-items-center items-center gap-2">`);
								Input($$renderer, { readonly: true, value: designSystem.shareUrl });
								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'icon',
									onclick: () => clipboard.copy(designSystem.shareUrl),
									children: ($$renderer) => {
										if (clipboard.copied) {
											$$renderer.push(`<!--[0--><div>`);
											CheckIcon($$renderer, { tabindex: -1 });
											$$renderer.push(`<!----> <span class="sr-only">Copied</span></div>`);
										} else {
											$$renderer.push(`<!--[-1--><div>`);
											CopyIcon($$renderer, { tabindex: -1 });
											$$renderer.push(`<!----> <span class="sr-only">Copy</span></div>`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></div>`);
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