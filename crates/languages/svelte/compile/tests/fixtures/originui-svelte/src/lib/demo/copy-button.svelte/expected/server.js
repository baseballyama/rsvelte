import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';

export default function Copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, code, $$slots, $$events, ...restProps } = $$props;
		let copied = false;

		const handleCopy = async () => {
			try {
				await navigator.clipboard.writeText(code);
				copied = true;
				setTimeout(() => copied = false, 1500);
			} catch(err) {
				console.error('Failed to copy text: ', err);
			}
		};

		if (Tooltip.TooltipProvider) {
			$$renderer.push('<!--[-->');

			Tooltip.TooltipProvider($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Tooltip) {
						$$renderer.push('<!--[-->');

						Tooltip.Tooltip($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'ghost', size: 'icon' },
											props,
											{
												children: ($$renderer) => {
													$$renderer.push(`<div${$.attr_class($.clsx(cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')))}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true"><path fill="#10B981" d="M14.548 3.488a.75.75 0 0 1-.036 1.06l-8.572 8a.75.75 0 0 1-1.023 0l-3.429-3.2a.75.75 0 0 1 1.024-1.096l2.917 2.722 8.06-7.522a.75.75 0 0 1 1.06.036Z"></path></svg></div> <div${$.attr_class($.clsx(cn('absolute transition-all', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')))}><svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 2.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5ZM10 1H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm3 5.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5v-1H5v1a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1v1.5Z"></path></svg></div>`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (Tooltip.TooltipTrigger) {
										$$renderer.push('<!--[-->');

										Tooltip.TooltipTrigger($$renderer, $.spread_props([
											{
												onclick: handleCopy,
												class: cn('text-muted-foreground/80 hover:text-foreground hover:bg-transparent disabled:opacity-100', className),
												'aria-label': copied ? 'Copied' : 'Copy component source',
												disabled: copied
											},
											restProps,
											{ child, $$slots: { child: true } }
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (Tooltip.TooltipContent) {
									$$renderer.push('<!--[-->');

									Tooltip.TooltipContent($$renderer, {
										class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Copy`);
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
	});
}