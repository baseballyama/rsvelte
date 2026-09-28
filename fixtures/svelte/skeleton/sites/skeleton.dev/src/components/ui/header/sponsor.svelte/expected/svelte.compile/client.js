import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import HeartIcon from '@lucide/svelte/icons/heart';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Sponsor($$anchor) {
	Menu($$anchor, {
		positioning: { placement: 'bottom-end' },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'hidden xl:flex btn p-2 hover:preset-tonal data-[state=open]:preset-tonal',
					title: 'Sponsor Us',
					'aria-label': 'Sponsor Us',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						HeartIcon(node_1, { class: 'fill-surface-950-50 size-5' });

						var node_2 = $.sibling(node_1, 2);

						ChevronDownIcon(node_2, { class: 'size-4 opacity-50' });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			Portal(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										class: 'z-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											$.component(node_6, () => Menu.ItemGroup, ($$anchor, Menu_ItemGroup) => {
												Menu_ItemGroup($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_2();
														var node_7 = $.first_child(fragment_6);

														$.component(node_7, () => Menu.ItemGroupLabel, ($$anchor, Menu_ItemGroupLabel) => {
															Menu_ItemGroupLabel($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text('Support Skeleton');

																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														});

														var node_8 = $.sibling(node_7, 2);

														{
															const element = ($$anchor, attributes = $.noop) => {
																var a = root_1();

																$.attribute_effect(a, () => ({
																	...attributes(),
																	href: 'https://github.com/sponsors/skeletonlabs',
																	target: '_blank',
																	rel: 'noreferrer noopener'
																}));

																var node_9 = $.child(a);

																$.component(node_9, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
																	Menu_ItemText($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Via GitHub');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																ArrowUpRightIcon(node_10, { class: 'size-4 opacity-60' });
																$.reset(a);
																$.append($$anchor, a);
															};

															$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item) => {
																Menu_Item($$anchor, { value: 'github', element, $$slots: { element: true } });
															});
														}

														var node_11 = $.sibling(node_8, 2);

														{
															const element = ($$anchor, attributes = $.noop) => {
																var a_1 = root_1();

																$.attribute_effect(a_1, () => ({
																	...attributes(),
																	href: 'https://ko-fi.com/skeletonlabs',
																	target: '_blank',
																	rel: 'noreferrer noopener'
																}));

																var node_12 = $.child(a_1);

																$.component(node_12, () => Menu.ItemText, ($$anchor, Menu_ItemText_1) => {
																	Menu_ItemText_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Via Ko-Fi');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_13 = $.sibling(node_12, 2);

																ArrowUpRightIcon(node_13, { class: 'size-4 opacity-60' });
																$.reset(a_1);
																$.append($$anchor, a_1);
															};

															$.component(node_11, () => Menu.Item, ($$anchor, Menu_Item_1) => {
																Menu_Item_1($$anchor, { value: 'kofi', element, $$slots: { element: true } });
															});
														}

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
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}