import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import CheckIcon from '@lucide/svelte/icons/check';
import CopyIcon from '@lucide/svelte/icons/copy';

export default function Button_28($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let copied = false;

		function handleCopy() {
			copied = true;
			setTimeout(() => copied = false, 1500);
		}

		TooltipProvider($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline', size: 'icon' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<div${$.attr_class($.clsx(cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')))}>`);
											CheckIcon($$renderer, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
											$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(cn('absolute transition-all', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')))}>`);
											CopyIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
											$$renderer.push(`<!----></div>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							TooltipTrigger($$renderer, {
								class: 'disabled:opacity-100',
								onclick: handleCopy,
								'aria-label': copied ? 'Copied' : 'Copy component source',
								disabled: copied,
								child,
								$$slots: { child: true }
							});
						}

						$$renderer.push(`<!----> `);

						TooltipContent($$renderer, {
							class: 'px-2 py-1 text-xs',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click to copy`);
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