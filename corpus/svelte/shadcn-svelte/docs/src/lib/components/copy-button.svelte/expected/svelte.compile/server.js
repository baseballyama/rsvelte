import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			variant = "ghost",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const clipboard = new UseClipboard();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rp = $.derived(() => restProps);

		if (Tooltip.Root) {
			$$renderer.push('<!--[-->');

			Tooltip.Root($$renderer, {
				disableCloseOnTriggerClick: true,
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								props,
								{
									'data-slot': 'copy-button',
									size: 'icon',
									variant,
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

							Tooltip.Trigger($$renderer, $.spread_props([
								rp(),
								{
									class: cn("absolute end-2 top-3 z-10 size-7 bg-code hover:opacity-100 focus-visible:opacity-100", className),
									onclick: () => clipboard.copy(text),
									child,
									$$slots: { child: true }
								}
							]));

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
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(clipboard.copied ? "Copied" : "Copy to Clipboard")}`);
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