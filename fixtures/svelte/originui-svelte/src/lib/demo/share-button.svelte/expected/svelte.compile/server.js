import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import Share from '@lucide/svelte/icons/share-2';
import { page } from '$app/state';

export default function Share_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { component, $$slots, $$events, ...restProps } = $$props;

		async function shareComponent() {
			const shareData = {
				text: `Check out the ${component.name} component from Origin UI - Svelte`,
				title: `Origin UI - Svelte - ${component.name}`,
				url: page.url.href
			};

			try {
				if (navigator.share) {
					await navigator.share(shareData);
				} else {
					await navigator.clipboard.writeText(shareData.url);
				}
			} catch(err) {
				console.error('Error sharing:', err);
			}
		}

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
													Share($$renderer, { size: 16, 'aria-hidden': true });
													$$renderer.push(`<!----> <span class="sr-only">Share the $${$.escape(component.name)} component</span>`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (Tooltip.TooltipTrigger) {
										$$renderer.push('<!--[-->');

										Tooltip.TooltipTrigger($$renderer, $.spread_props([
											{ onclick: shareComponent },
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->Share the ${$.escape(component.name)} component`);
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