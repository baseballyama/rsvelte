import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContentImg from '$assets/dialog-content.png?w=382&h=216&enhanced';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';

var root = $.from_html(`<a><enhanced:img class="size-full object-cover" alt="Content Image"></enhanced:img></a>`);

var root_1 = $.from_html(`<div class="space-y-3"><div class="space-y-1"><h2 class="font-semibold">Building a Design System with Svelte and Tailwind CSS</h2> <p class="text-muted-foreground text-sm">Learn how to build a comprehensive design system using Tailwind CSS, including component
					architecture, and theme customization.</p></div> <div class="text-muted-foreground flex items-center gap-2 text-xs"><span>8 min read</span> <span>·</span> <span>Updated 2 days ago</span></div></div>`);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_12($$anchor) {
	HoverCard($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					var a = root();

					$.attribute_effect(a, () => ({
						class: 'flex size-16 overflow-hidden rounded-lg p-0',
						'aria-label': 'My profile',
						href: '#title',
						...props()
					}));

					var enhanced_img = $.only_child(a);

					$.template_effect(() => $.set_attribute(enhanced_img, 'src', ContentImg));
					$.append($$anchor, a);
				};

				HoverCardTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			HoverCardContent(node_1, {
				class: 'w-[320px]',
				showArrow: true,
				children: ($$anchor, $$slotProps) => {
					var div = root_1();

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}