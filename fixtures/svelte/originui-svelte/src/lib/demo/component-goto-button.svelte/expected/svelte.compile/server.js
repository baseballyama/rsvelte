import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import Link from '@lucide/svelte/icons/square-arrow-out-up-right';

export default function Component_goto_button($$renderer, $$props) {
	let { description, href, $$slots, $$events, ...restProps } = $$props;

	if (Tooltip.TooltipProvider) {
		$$renderer.push('<!--[-->');

		Tooltip.TooltipProvider($$renderer, {
			children: ($$renderer) => {
				if (Tooltip.Tooltip) {
					$$renderer.push('<!--[-->');

					Tooltip.Tooltip($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ href, variant: 'ghost', size: 'icon' },
										props,
										{
											children: ($$renderer) => {
												Link($$renderer, { size: 16, 'aria-hidden': true });
												$$renderer.push(`<!----> <span class="sr-only">${$.escape(description)}</span>`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Tooltip.TooltipTrigger) {
									$$renderer.push('<!--[-->');
									Tooltip.TooltipTrigger($$renderer, $.spread_props([restProps, { children, $$slots: { default: true } }]));
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
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(description)}`);
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
}