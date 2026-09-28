import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import AvatarImg from '$assets/avatar-40-04.jpg?w=40&h=40&enhanced';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';

export default function Tooltip_10($$renderer) {
	HoverCard($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{
							class: 'size-auto overflow-hidden rounded-full bg-transparent p-0 hover:bg-transparent',
							'aria-label': 'My profile',
							href: '#title'
						},
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<enhanced:img class="size-10"${$.attr('src', AvatarImg)} alt="Avatar"></enhanced:img>`);
							},
							$$slots: { default: true }
						}
					]));
				}

				HoverCardTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			HoverCardContent($$renderer, {
				class: 'w-[340px]',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-start gap-3"><div class="shrink-0"><enhanced:img class="size-10 rounded-full"${$.attr('src', AvatarImg)} alt="Avatar"></enhanced:img></div> <div class="space-y-1"><p class="text-sm font-medium">@Origin_UI</p> <p class="text-muted-foreground text-sm">Beautiful UI components built with Tailwind CSS and Svelte</p></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}