import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import ExternalLink from '@lucide/svelte/icons/external-link';
import Package from '@lucide/svelte/icons/package';

export default function Component_dependency($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, dependency } = $$props;

		TooltipProvider($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										class: cn('border-border grid h-fit items-start justify-stretch gap-2 border', className),
										href: dependency.url,
										target: '_blank',
										rel: 'noopener noreferrer',
										children: ($$renderer) => {
											$$renderer.push(`<div class="flex items-center justify-between gap-4"><span class="font-mono text-sm"${$.attr('title', dependency.packageName)}>${$.escape(dependency.packageName)}</span> <span class="bg-muted text-muted-foreground justify-self-end rounded-full px-2 py-1 text-xs">${$.escape(dependency.dev ? 'Dev' : 'Prod')}</span></div> <div class="text-muted-foreground flex items-center justify-between gap-4 text-xs"><div class="flex items-center">`);
											Package($$renderer, { class: 'mr-1 h-3 w-3' });
											$$renderer.push(`<!----> <span class="truncate"${$.attr('title', dependency.name)}>${$.escape(dependency.name)}</span></div> `);
											ExternalLink($$renderer, { class: 'h-3 w-3' });
											$$renderer.push(`<!----></div>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							TooltipTrigger($$renderer, { child, $$slots: { child: true } });
						}

						$$renderer.push(`<!----> `);

						TooltipContent($$renderer, {
							class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
							children: ($$renderer) => {
								$$renderer.push(`<p>Package: ${$.escape(dependency.packageName)}</p> <p>Name: ${$.escape(dependency.name)}</p> <p>Type: ${$.escape(dependency.dev ? 'Dev Dependency' : 'Prod Dependency')}</p>`);
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