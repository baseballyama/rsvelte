import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BedDoubleIcon from '@lucide/svelte/icons/bed-double';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import BubblesIcon from '@lucide/svelte/icons/bubbles';
import HouseIcon from '@lucide/svelte/icons/house';
import MountainIcon from '@lucide/svelte/icons/mountain';
import PopcornIcon from '@lucide/svelte/icons/popcorn';
import SailboatIcon from '@lucide/svelte/icons/sailboat';
import SettingsIcon from '@lucide/svelte/icons/settings';
import SkullIcon from '@lucide/svelte/icons/skull';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import TvIcon from '@lucide/svelte/icons/tv';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<a href="https://www.skeleton.dev" class="btn-icon btn-icon-lg preset-filled-primary-500"><!></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800"><!> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div>`);

export default function Sidebar($$anchor) {
	const linksSidebar = {
		entertainment: [
			{ label: 'Books', href: '/#', icon: BookIcon },
			{ label: 'Movies', href: '/#', icon: PopcornIcon },
			{ label: 'Television', href: '/#', icon: TvIcon }
		],
		recreation: [
			{ label: 'Biking', href: '/#', icon: BikeIcon },
			{ label: 'Sailing', href: '/#', icon: SailboatIcon },
			{ label: 'Hiking', href: '/#', icon: MountainIcon }
		],
		relaxation: [
			{ label: 'Lounge', href: '/#', icon: TreePalmIcon },
			{ label: 'Spa', href: '/#', icon: BubblesIcon },
			{ label: 'Sleep', href: '/#', icon: BedDoubleIcon }
		]
	};

	var div = root_3();
	var node = $.child(div);

	Navigation(node, {
		layout: 'sidebar',
		class: 'grid grid-rows-[auto_1fr_auto] gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Navigation.Header, ($$anchor, Navigation_Header) => {
				Navigation_Header($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var a = root();
						var node_2 = $.child(a);

						SkullIcon(node_2, { class: 'size-6' });
						$.reset(a);
						$.append($$anchor, a);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_1, 2);

			$.component(node_3, () => Navigation.Content, ($$anchor, Navigation_Content) => {
				Navigation_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_4 = $.first_child(fragment_1);

						$.component(node_4, () => Navigation.Group, ($$anchor, Navigation_Group) => {
							Navigation_Group($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => Navigation.Menu, ($$anchor, Navigation_Menu) => {
										Navigation_Menu($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor) => {
													Navigation_TriggerAnchor($$anchor, {
														href: '/',
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root_1();
															var node_7 = $.first_child(fragment_4);

															HouseIcon(node_7, { class: 'size-4' });

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText) => {
																Navigation_TriggerText($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Home');

																		$.append($$anchor, text);
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
						});

						var node_9 = $.sibling(node_4, 2);

						$.each(node_9, 17, () => Object.entries(linksSidebar), $.index, ($$anchor, $$item) => {
							var $$array = $.derived(() => $.to_array($.get($$item), 2));
							let category = () => $.get($$array)[0];
							let links = () => $.get($$array)[1];
							var fragment_5 = $.comment();
							var node_10 = $.first_child(fragment_5);

							$.component(node_10, () => Navigation.Group, ($$anchor, Navigation_Group_1) => {
								Navigation_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_11 = $.first_child(fragment_6);

										$.component(node_11, () => Navigation.Label, ($$anchor, Navigation_Label) => {
											Navigation_Label($$anchor, {
												class: 'capitalize pl-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, category()));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Navigation.Menu, ($$anchor, Navigation_Menu_1) => {
											Navigation_Menu_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_13 = $.first_child(fragment_8);

													$.each(node_13, 16, links, (link) => link, ($$anchor, link) => {
														const Icon = $.derived(() => link.icon);
														var fragment_9 = $.comment();
														var node_14 = $.first_child(fragment_9);

														$.component(node_14, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_1) => {
															Navigation_TriggerAnchor_1($$anchor, {
																get href() {
																	return link.href;
																},

																get title() {
																	return link.label;
																},

																get 'aria-label'() {
																	return link.label;
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root_1();
																	var node_15 = $.first_child(fragment_10);

																	$.component(node_15, () => $.get(Icon), ($$anchor, Icon_1) => {
																		Icon_1($$anchor, { class: 'size-4' });
																	});

																	var node_16 = $.sibling(node_15, 2);

																	$.component(node_16, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_1) => {
																		Navigation_TriggerText_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, link.label));
																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													});

													$.append($$anchor, fragment_8);
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

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_17 = $.sibling(node_3, 2);

			$.component(node_17, () => Navigation.Footer, ($$anchor, Navigation_Footer) => {
				Navigation_Footer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = $.comment();
						var node_18 = $.first_child(fragment_12);

						$.component(node_18, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_2) => {
							Navigation_TriggerAnchor_2($$anchor, {
								href: '/',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_1();
									var node_19 = $.first_child(fragment_13);

									SettingsIcon(node_19, { class: 'size-4' });

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_2) => {
										Navigation_TriggerText_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Settings');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_12);
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