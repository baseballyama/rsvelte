import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, LinkPreview } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import MapPin from "phosphor-svelte/lib/MapPin";

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"><!> <!></div>`);
var root_1 = $.from_html(`<div class="flex space-x-4"><!> <div class="space-y-1 text-sm"><h4 class="font-medium">@huntabyte</h4> <p>I do things on the internet.</p> <div class="text-muted-foreground flex items-center gap-[21px] pt-2 text-xs"><div class="flex items-center text-xs"><!> <span>FL, USA</span></div> <div class="flex items-center text-xs"><!> <span>Joined May 2020</span></div></div></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Avatar_demo_link_preview($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => LinkPreview.Root, ($$anchor, LinkPreview_Root) => {
		LinkPreview_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => LinkPreview.Trigger, ($$anchor, LinkPreview_Trigger) => {
					LinkPreview_Trigger($$anchor, {
						href: 'https://x.com/huntabyte',
						target: '_blank',
						rel: 'noreferrer noopener',
						class: 'rounded-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
								Avatar_Root($$anchor, {
									class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border border-transparent text-[17px] font-medium uppercase',
									children: ($$anchor, $$slotProps) => {
										var div = root();
										var node_3 = $.child(div);

										$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, { src: '/avatar-1.png', alt: '@huntabyte' });
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
											Avatar_Fallback($$anchor, {
												class: 'border-muted border',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('HB');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => LinkPreview.Content, ($$anchor, LinkPreview_Content) => {
					LinkPreview_Content($$anchor, {
						class: 'border-muted bg-background shadow-popover w-[331px] rounded-xl border p-[17px]',
						sideOffset: 8,
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_1();
							var node_6 = $.child(div_1);

							$.component(node_6, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
								Avatar_Root_1($$anchor, {
									class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border border-transparent text-[17px] font-medium uppercase',
									children: ($$anchor, $$slotProps) => {
										var div_2 = root();
										var node_7 = $.child(div_2);

										$.component(node_7, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
											Avatar_Image_1($$anchor, { src: '/avatar-1.png', alt: '@huntabyte' });
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
											Avatar_Fallback_1($$anchor, {
												class: 'border-muted border',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('HB');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_2);
										$.append($$anchor, div_2);
									},
									$$slots: { default: true }
								});
							});

							var div_3 = $.sibling(node_6, 2);
							var div_4 = $.sibling($.child(div_3), 4);
							var div_5 = $.child(div_4);
							var node_9 = $.child(div_5);

							MapPin(node_9, { class: 'mr-1 size-4' });
							$.next(2);
							$.reset(div_5);

							var div_6 = $.sibling(div_5, 2);
							var node_10 = $.child(div_6);

							CalendarBlank(node_10, { class: 'mr-1 size-4' });
							$.next(2);
							$.reset(div_6);
							$.reset(div_4);
							$.reset(div_3);
							$.reset(div_1);
							$.append($$anchor, div_1);
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