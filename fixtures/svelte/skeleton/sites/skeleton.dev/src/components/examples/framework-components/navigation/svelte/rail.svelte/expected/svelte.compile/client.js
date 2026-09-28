import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import HouseIcon from '@lucide/svelte/icons/house';
import SettingsIcon from '@lucide/svelte/icons/settings';
import SkullIcon from '@lucide/svelte/icons/skull';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full h-[640px] grid grid-cols-[auto_1fr] border border-surface-200-800"><!> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div>`);

export default function Rail($$anchor) {
	const links = [
		{ label: 'Home', href: '/#', icon: HouseIcon },
		{ label: 'Entertainment', href: '/#', icon: BookIcon },
		{ label: 'Recreation', href: '/#', icon: BikeIcon },
		{ label: 'Relaxation', href: '/#', icon: TreePalmIcon }
	];

	var div = root_2();
	var node = $.child(div);

	Navigation(node, {
		layout: 'rail',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Navigation.Header, ($$anchor, Navigation_Header) => {
				Navigation_Header($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor) => {
							Navigation_TriggerAnchor($$anchor, {
								href: '/#',
								title: 'View Homepage',
								'aria-label': 'View Homepage',
								children: ($$anchor, $$slotProps) => {
									SkullIcon($$anchor, { class: 'size-8' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_1, 2);

			$.component(node_3, () => Navigation.Content, ($$anchor, Navigation_Content) => {
				Navigation_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.component(node_4, () => Navigation.Menu, ($$anchor, Navigation_Menu) => {
							Navigation_Menu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.each(node_5, 16, () => links, (link) => link, ($$anchor, link) => {
										const Icon = $.derived(() => link.icon);
										var fragment_5 = $.comment();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_1) => {
											Navigation_TriggerAnchor_1($$anchor, {
												get href() {
													return link.href;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_7 = $.first_child(fragment_6);

													$.component(node_7, () => $.get(Icon), ($$anchor, Icon_1) => {
														Icon_1($$anchor, { class: 'size-5' });
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText) => {
														Navigation_TriggerText($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, link.label));
																$.append($$anchor, text);
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

			var node_9 = $.sibling(node_3, 2);

			$.component(node_9, () => Navigation.Footer, ($$anchor, Navigation_Footer) => {
				Navigation_Footer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_10 = $.first_child(fragment_8);

						$.component(node_10, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_2) => {
							Navigation_TriggerAnchor_2($$anchor, {
								href: '/#',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$anchor, $$slotProps) => {
									SettingsIcon($$anchor, { class: 'size-5' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}