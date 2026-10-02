import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import AvatarImg from '$assets/avatar-40-04.jpg?w=40&h=40&enhanced';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';

var root = $.from_html(`<enhanced:img class=" size-10" alt="Avatar"></enhanced:img>`);
var root_1 = $.from_html(`<div class="flex items-start gap-3"><div class="shrink-0"><enhanced:img class="size-10 rounded-full" alt="Avatar"></enhanced:img></div> <div class="space-y-1"><p class="text-sm font-medium">@Origin_UI</p> <p class="text-muted-foreground text-sm">Beautiful UI components built with Tailwind CSS and Svelte</p></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_10($$anchor) {
	HoverCard($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							class: 'size-auto overflow-hidden rounded-full bg-transparent p-0 hover:bg-transparent',
							'aria-label': 'My profile',
							href: '#title'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								var enhanced_img = root();

								$.template_effect(() => $.set_attribute(enhanced_img, 'src', AvatarImg));
								$.append($$anchor, enhanced_img);
							},
							$$slots: { default: true }
						}
					));
				};

				HoverCardTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			HoverCardContent(node_1, {
				class: 'w-[340px]',
				children: ($$anchor, $$slotProps) => {
					var div = root_1();
					var div_1 = $.child(div);
					var enhanced_img_1 = $.only_child(div_1);

					$.next(2);
					$.reset(div);
					$.template_effect(() => $.set_attribute(enhanced_img_1, 'src', AvatarImg));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}