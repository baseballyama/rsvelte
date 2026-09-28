import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import Code from '@lucide/svelte/icons/code';

export default function View_component_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, onclick, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn(className)))}>`);

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
													Code($$renderer, { size: 16, 'aria-hidden': true });
													$$renderer.push(`<!----> <span class="sr-only">View component Details</span>`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (Tooltip.TooltipTrigger) {
										$$renderer.push('<!--[-->');

										Tooltip.TooltipTrigger($$renderer, $.spread_props([
											{
												onclick,
												class: 'text-muted-foreground/80 hover:text-foreground hover:bg-transparent',
												'aria-label': 'View component Details'
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
											$$renderer.push(`<!---->View component details`);
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

		$$renderer.push(`</div>`);
	});
}