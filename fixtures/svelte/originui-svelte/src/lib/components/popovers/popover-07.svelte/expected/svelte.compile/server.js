import * as $ from 'svelte/internal/server';
import Input from '../ui/input.svelte';
import Button from '$lib/components/ui/button.svelte';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import RiCodeFill from '~icons/ri/code-fill';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiMailLine from '~icons/ri/mail-line';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';
import { cn } from '$lib/utils';

export default function Popover_07($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let copied = false;
		let inputRef = null;

		function handleCopy() {
			if (!inputRef) return;

			navigator.clipboard.writeText(inputRef.value);
			copied = true;
			setTimeout(() => copied = false, 1500);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			Popover($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ variant: 'outline' },
								props,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->Share`);
									},
									$$slots: { default: true }
								}
							]));
						}

						PopoverTrigger($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);

					PopoverContent($$renderer, {
						class: 'w-72',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-col gap-3 text-center"><div class="text-sm font-medium">Share code</div> <div class="flex flex-wrap justify-center gap-2">`);

							Button($$renderer, {
								size: 'icon',
								variant: 'outline',
								'aria-label': 'Embed',
								children: ($$renderer) => {
									RiCodeFill($$renderer, { class: 'size-4', 'aria-hidden': 'true' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'icon',
								variant: 'outline',
								'aria-label': 'Share on Twitter',
								children: ($$renderer) => {
									RiTwitterXFill($$renderer, { class: 'size-4', 'aria-hidden': 'true' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'icon',
								variant: 'outline',
								'aria-label': 'Share on Facebook',
								children: ($$renderer) => {
									RiFacebookFill($$renderer, { class: 'size-4', 'aria-hidden': 'true' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'icon',
								variant: 'outline',
								'aria-label': 'Share via email',
								children: ($$renderer) => {
									RiMailLine($$renderer, { class: 'size-4', 'aria-hidden': 'true' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div class="space-y-2"><div class="relative">`);

							Input($$renderer, {
								id: 'input-53',
								class: 'pe-9',
								type: 'text',
								value: 'https://originui-svelte.pages.dev/',
								'aria-label': 'Share link',
								readonly: true,
								get ref() {
									return inputRef;
								},

								set ref($$value) {
									inputRef = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							TooltipProvider($$renderer, {
								delayDuration: 0,
								children: ($$renderer) => {
									Tooltip($$renderer, {
										children: ($$renderer) => {
											{
												function child($$renderer) {
													$$renderer.push(`<button class="text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-solid disabled:pointer-events-none disabled:cursor-not-allowed"${$.attr('aria-label', copied ? 'Copied' : 'Copy to clipboard')}${$.attr('disabled', copied, true)}><div${$.attr_class($.clsx(cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')))}>`);
													Check($$renderer, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
													$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(cn('absolute transition-all', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')))}>`);
													Copy($$renderer, { size: 16, 'aria-hidden': 'true' });
													$$renderer.push(`<!----></div></button>`);
												}

												TooltipTrigger($$renderer, { child, $$slots: { child: true } });
											}

											$$renderer.push(`<!----> `);

											TooltipContent($$renderer, {
												class: 'px-2 py-1 text-xs',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Copy to clipboard`);
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

							$$renderer.push(`<!----></div></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}