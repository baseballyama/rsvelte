import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FriendImg01 from '$assets/avatar-20-04.jpg?w=20&h=20&enhanced';
import FriendImg02 from '$assets/avatar-20-05.jpg?w=20&h=20&enhanced';
import FriendImg03 from '$assets/avatar-20-06.jpg?w=20&h=20&enhanced';
import AvatarImg from '$assets/avatar-40-05.jpg?w=40&h=40&enhanced';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';

var root = $.from_html(`<a>Keith Kennedy</a>`);

var root_1 = $.from_html(`<div class="space-y-3"><div class="flex items-center gap-3"><enhanced:img class="shrink-0 rounded-full" alt="Avatar"></enhanced:img> <div class="space-y-0.5"><p class="text-sm font-medium">Keith Kennedy</p> <p class="text-muted-foreground text-xs">@k.kennedy</p></div></div> <p class="text-muted-foreground text-sm">Designer at <strong class="text-foreground font-medium">@Origin UI - Svelte</strong>.
				Crafting web experiences with Tailwind CSS.</p> <div class="flex items-center gap-2"><div class="flex -space-x-1.5"><enhanced:img class="ring-background rounded-full ring-1" alt="Friend 01"></enhanced:img> <enhanced:img class="ring-background rounded-full ring-1" alt="Friend 02"></enhanced:img> <enhanced:img class="ring-background rounded-full ring-1" alt="Friend 03"></enhanced:img></div> <div class="text-muted-foreground text-xs">3 mutual friends</div></div></div>`);

var root_2 = $.from_html(`<div class="flex items-center gap-3"><enhanced:img class="shrink-0 rounded-full" alt="Avatar"></enhanced:img> <div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">@k.kennedy</p></div></div> <!>`, 1);

export default function Tooltip_11($$anchor) {
	HoverCard($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var enhanced_img = $.child(div);
			var div_1 = $.sibling(enhanced_img, 2);
			var node = $.child(div_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					var a = root();

					$.attribute_effect(a, () => ({
						class: 'text-sm font-medium hover:underline',
						href: '#title',
						...props()
					}));

					$.append($$anchor, a);
				};

				HoverCardTrigger(node, { child, $$slots: { child: true } });
			}

			$.next(2);
			$.reset(div_1);
			$.reset(div);

			var node_1 = $.sibling(div, 2);

			HoverCardContent(node_1, {
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_1();
					var div_3 = $.child(div_2);
					var enhanced_img_1 = $.child(div_3);

					$.next(2);
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 4);
					var div_5 = $.child(div_4);
					var enhanced_img_2 = $.child(div_5);
					var enhanced_img_3 = $.sibling(enhanced_img_2, 2);
					var enhanced_img_4 = $.sibling(enhanced_img_3, 2);

					$.reset(div_5);
					$.next(2);
					$.reset(div_4);
					$.reset(div_2);

					$.template_effect(() => {
						$.set_attribute(enhanced_img_1, 'src', AvatarImg);
						$.set_attribute(enhanced_img_2, 'src', FriendImg01);
						$.set_attribute(enhanced_img_3, 'src', FriendImg02);
						$.set_attribute(enhanced_img_4, 'src', FriendImg03);
					});

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_attribute(enhanced_img, 'src', AvatarImg));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}