import * as $ from 'svelte/internal/server';
import ContentImg from '$assets/dialog-content.png?w=382&h=216&enhanced';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';

export default function Tooltip_12($$renderer) {
	HoverCard($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					$$renderer.push(`<a${$.attributes({
						class: 'flex size-16 overflow-hidden rounded-lg p-0',
						'aria-label': 'My profile',
						href: '#title',
						...props
					})}><enhanced:img class="size-full object-cover"${$.attr('src', ContentImg)} alt="Content Image"></enhanced:img></a>`);
				}

				HoverCardTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			HoverCardContent($$renderer, {
				class: 'w-[320px]',
				showArrow: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-3"><div class="space-y-1"><h2 class="font-semibold">Building a Design System with Svelte and Tailwind CSS</h2> <p class="text-muted-foreground text-sm">Learn how to build a comprehensive design system using Tailwind CSS, including component
					architecture, and theme customization.</p></div> <div class="text-muted-foreground flex items-center gap-2 text-xs"><span>8 min read</span> <span>·</span> <span>Updated 2 days ago</span></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}