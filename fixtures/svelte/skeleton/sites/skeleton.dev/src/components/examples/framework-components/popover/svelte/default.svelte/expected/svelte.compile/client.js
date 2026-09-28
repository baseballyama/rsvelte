import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XIcon from '@lucide/svelte/icons/x';
import { Avatar, Popover, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="space-y-4"><header class="grid grid-cols-[auto_1fr_auto] gap-4 items-center"><!> <div><!> <a href="https://bsky.app/profile/skeleton.dev" target="_blank" class="anchor">@skeletonlabs.dev</a></div> <!></header> <!> <div class="flex gap-4"><p class="text-sm">800 <span class="opacity-60">Followers</span></p> <p class="text-sm">120 <span class="opacity-60">Following</span></p> <p class="text-sm">100 <span class="opacity-60">Posts</span></p></div></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
				Popover_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Trigger');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
						Popover_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
									Popover_Content($$anchor, {
										class: 'card w-96 p-4 bg-surface-100-900 shadow-xl',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var div = $.first_child(fragment_4);
											var header = $.child(div);
											var node_4 = $.child(header);

											Avatar(node_4, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Avatar.Image, ($$anchor, Avatar_Image) => {
														Avatar_Image($$anchor, {
															src: 'https://cdn.bsky.app/img/avatar/plain/did:plc:whtgi5zx7ylmdw2i76vq7vq4/bafkreibgoxuqahwcpiah22yfovqszh33x2u4sysmqoyuk5j54aoakt7364@jpeg',
															alt: 'Skeleton Labs'
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});

											var div_1 = $.sibling(node_4, 2);
											var node_6 = $.child(div_1);

											$.component(node_6, () => Popover.Title, ($$anchor, Popover_Title) => {
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
											$.reset(div_1);

											var node_7 = $.sibling(div_1, 2);

											$.component(node_7, () => Popover.CloseTrigger, ($$anchor, Popover_CloseTrigger) => {
												Popover_CloseTrigger($$anchor, {
													class: 'btn-icon hover:preset-tonal self-start',
													children: ($$anchor, $$slotProps) => {
														XIcon($$anchor, { class: 'size-4' });
													},
													$$slots: { default: true }
												});
											});

											$.reset(header);

											var node_8 = $.sibling(header, 2);

											$.component(node_8, () => Popover.Description, ($$anchor, Popover_Description) => {
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
											$.reset(div);

											var node_9 = $.sibling(div, 2);

											$.component(node_9, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
												Popover_Arrow($$anchor, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => Popover.ArrowTip, ($$anchor, Popover_ArrowTip) => {
															Popover_ArrowTip($$anchor, {});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}