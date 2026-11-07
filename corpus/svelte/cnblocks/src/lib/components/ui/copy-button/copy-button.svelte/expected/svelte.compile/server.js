import * as $ from 'svelte/internal/server';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "$lib/components/ui/tooltip";
import { Button } from "$lib/components/ui/button";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";
import { cn } from "$lib/utils.js";
import { scale } from "svelte/transition";
import Check from "@lucide/svelte/icons/check";
import Copy from "@lucide/svelte/icons/copy";
import X from "@lucide/svelte/icons/x";

export default function Copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// interface Props extends Omit<ButtonProps, "href"> {
		// 	text: string;
		// 	icon?: Snippet<[]>;
		// 	animationDuration?: number;
		// 	onCopy?: (status: UseClipboard["status"]) => void;
		// }
		let {
			text,
			icon,
			animationDuration = 300,
			variant = "ghost",
			size = "icon",
			onCopy,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const clipboard = new UseClipboard({ delay: 1500 });

		TooltipProvider($$renderer, {
			delayDuration: 200,
			children: ($$renderer) => {
				Tooltip($$renderer, {
					children: ($$renderer) => {
						TooltipTrigger($$renderer, {
							class: className,
							children: ($$renderer) => {
								Button($$renderer, $.spread_props([
									restProps,
									{
										variant,
										size,
										class: cn("z-50 h-8 w-8"),
										type: 'button',
										name: 'copy',
										tabindex: -1,
										onclick: async () => {
											const status = await clipboard.copy(text);

											onCopy?.(status);
										},

										children: ($$renderer) => {
											if (clipboard.status === "success") {
												$$renderer.push(`<!--[0--><div>`);
												Check($$renderer, { class: 'size-3.5! text-[#10B981]' });
												$$renderer.push(`<!----> <span class="sr-only">Copied</span></div>`);
											} else if (clipboard.status === "failure") {
												$$renderer.push(`<!--[1--><div>`);
												X($$renderer, { class: 'size-3.5!' });
												$$renderer.push(`<!----> <span class="sr-only">Failed to copy</span></div>`);
											} else {
												$$renderer.push(`<!--[-1--><div>`);

												if (icon) {
													$$renderer.push('<!--[0-->');
													icon($$renderer);
													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push('<!--[-1-->');
													Copy($$renderer, { class: 'size-3.5! opacity-50' });
												}

												$$renderer.push(`<!--]--> <span class="sr-only">Copy</span></div>`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TooltipContent($$renderer, {
							align: 'center',
							side: 'top',
							class: 'z-50 px-2 py-1 text-[10px]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Copy Code`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}