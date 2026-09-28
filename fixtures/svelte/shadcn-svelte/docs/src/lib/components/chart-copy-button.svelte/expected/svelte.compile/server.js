import * as $ from 'svelte/internal/server';
import CheckIcon from "@tabler/icons-svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Chart_copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, code, $$slots, $$events, ...restProps } = $$props;
		const clipboard = new UseClipboard();

		if (Tooltip.Root) {
			$$renderer.push('<!--[-->');

			Tooltip.Root($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ size: 'icon', variant: 'ghost' },
								props,
								{
									class: cn("[&_svg]-h-3.5 h-7 w-7 rounded-[6px] [&_svg]:w-3.5", className),
									onclick: () => {
										clipboard.copy(code);
									}
								},
								restProps,
								{
									children: ($$renderer) => {
										$$renderer.push(`<span class="sr-only" data-llm-ignore="">Copy</span> `);

										if (clipboard.copied) {
											$$renderer.push('<!--[0-->');
											CheckIcon($$renderer, {});
										} else {
											$$renderer.push('<!--[-1-->');
											CopyIcon($$renderer, {});
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								}
							]));
						}

						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');
							Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					if (Tooltip.Content) {
						$$renderer.push('<!--[-->');

						Tooltip.Content($$renderer, {
							class: 'bg-black text-white',
							arrowClasses: 'bg-black',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Copy code`);
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