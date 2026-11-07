import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XIcon from '@lucide/svelte/icons/x';
import { Avatar, Popover, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="space-y-4"><header class="grid grid-cols-[auto_1fr_auto] gap-4 items-center"><!> <div><!> <a href="https://bsky.app/profile/skeleton.dev" target="_blank" rel="noopener noreferrer" class="anchor">@skeletonlabs.dev</a></div> <!></header> <!> <div class="flex gap-4"><p class="text-sm">800 <span class="opacity-60">Followers</span></p> <p class="text-sm">120 <span class="opacity-60">Following</span></p> <p class="text-sm">100 <span class="opacity-60">Posts</span></p></div></div> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-4"><!> <!></div> <!>`, 1);

export default function Anchor($$anchor) {
	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			$.component(node, () => Popover.Anchor, ($$anchor, Popover_Anchor) => {
				Popover_Anchor($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Avatar($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
									Avatar_Image($$anchor, {
										src: 'https://cdn.bsky.app/img/avatar/plain/did:plc:whtgi5zx7ylmdw2i76vq7vq4/bafkreibgoxuqahwcpiah22yfovqszh33x2u4sysmqoyuk5j54aoakt7364@jpeg',
										alt: 'Skeleton Labs'
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
				Popover_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Show Profile');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			Portal(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					$.component(node_4, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
						Popover_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_5 = $.first_child(fragment_5);

								$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
									Popover_Content($$anchor, {
										class: 'card w-96 p-4 bg-surface-100-900 shadow-xl',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var div_1 = $.first_child(fragment_6);
											var header = $.child(div_1);
											var node_6 = $.child(header);

											Avatar(node_6, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_7 = $.first_child(fragment_7);

													$.component(node_7, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
														Avatar_Image_1($$anchor, {
															src: 'https://cdn.bsky.app/img/avatar/plain/did:plc:whtgi5zx7ylmdw2i76vq7vq4/bafkreibgoxuqahwcpiah22yfovqszh33x2u4sysmqoyuk5j54aoakt7364@jpeg',
															alt: 'Skeleton Labs'
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});

											var div_2 = $.sibling(node_6, 2);
											var node_8 = $.child(div_2);

											$.component(node_8, () => Popover.Title, ($$anchor, Popover_Title) => {
												Popover_Title($$anchor, {
													class: 'text-lg font-bold',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Skeleton Labs');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.next(2);
											$.reset(div_2);

											var node_9 = $.sibling(div_2, 2);

											$.component(node_9, () => Popover.CloseTrigger, ($$anchor, Popover_CloseTrigger) => {
												Popover_CloseTrigger($$anchor, {
													class: 'btn-icon hover:preset-tonal self-start',
													children: ($$anchor, $$slotProps) => {
														XIcon($$anchor, { class: 'size-4' });
													},
													$$slots: { default: true }
												});
											});

											$.reset(header);

											var node_10 = $.sibling(header, 2);

											$.component(node_10, () => Popover.Description, ($$anchor, Popover_Description) => {
												Popover_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Your friendly neighborhood open source maintainers. Creators of Skeleton.');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											$.next(2);
											$.reset(div_1);

											var node_11 = $.sibling(div_1, 2);

											$.component(node_11, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
												Popover_Arrow($$anchor, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_12 = $.first_child(fragment_9);

														$.component(node_12, () => Popover.ArrowTip, ($$anchor, Popover_ArrowTip) => {
															Popover_ArrowTip($$anchor, {});
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}