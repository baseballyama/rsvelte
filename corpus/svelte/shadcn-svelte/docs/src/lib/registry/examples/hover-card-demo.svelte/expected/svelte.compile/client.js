import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex justify-between space-x-4"><!> <div class="space-y-1"><h4 class="text-sm font-semibold">@sveltejs</h4> <p class="text-sm">Cybernetically enhanced web apps.</p> <div class="flex items-center pt-2"><!> <span class="text-xs text-muted-foreground">Joined September 2022</span></div></div></div>`);

export default function Hover_card_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
		HoverCard_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
					HoverCard_Trigger($$anchor, {
						href: 'https://github.com/sveltejs',
						target: '_blank',
						rel: 'noreferrer noopener',
						class: 'rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('@sveltejs');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
					HoverCard_Content($$anchor, {
						class: 'w-80',
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var node_3 = $.child(div);

							$.component(node_3, () => Avatar.Root, ($$anchor, Avatar_Root) => {
								Avatar_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, { src: 'https://github.com/sveltejs.png' });
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
											Avatar_Fallback($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('SK');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var div_1 = $.sibling(node_3, 2);
							var div_2 = $.sibling($.child(div_1), 4);
							var node_6 = $.child(div_2);

							CalendarDaysIcon(node_6, { class: 'me-2 size-4 opacity-70' });
							$.next(2);
							$.reset(div_2);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}