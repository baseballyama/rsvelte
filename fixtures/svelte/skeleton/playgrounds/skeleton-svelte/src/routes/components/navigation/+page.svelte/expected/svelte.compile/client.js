import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<a href="https://www.skeleton.dev" class="btn-icon btn-icon-lg preset-filled-primary-500"><!></a>`);
var root_3 = $.from_html(`<span>Resize</span>`);
var root_4 = $.from_html(`<div class="space-y-10"><header><h2 class="h2">Navigation</h2></header> <section class="space-y-4"><h3 class="h3">Bar</h3> <div class="w-[375px] h-[667px] grid grid-rows-[1fr_auto] border border-surface-200-800"><div class="flex justify-center items-center"><p>Contents</p></div> <!></div></section> <section class="space-y-4"><h3 class="h3">Rail</h3> <div class="w-full h-[728px] grid grid-cols-[auto_1fr] border border-surface-200-800"><!> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div></section> <section class="space-y-4"><h3 class="h3">Sidebar</h3> <div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800"><!> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div></section> <section class="space-y-4"><h3 class="h3">Toggle Layout</h3> <pre class="pre"> </pre> <div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800"><!> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div></section></div>`);

export default function _page($$anchor) {
	const links = [
		{ label: 'Home', href: '#', icon: HouseIcon },
		{ label: 'Entertainment', href: '#', icon: BookIcon },
		{ label: 'Recreation', href: '#', icon: BikeIcon },
		{ label: 'Relaxation', href: '#', icon: TreePalmIcon }
	];

	const linksSidebar = {
		entertainment: [
			{ label: 'Books', href: '#', icon: BookIcon },
			{ label: 'Movies', href: '#', icon: PopcornIcon },
			{ label: 'Television', href: '#', icon: TvIcon }
		],
		recreation: [
			{ label: 'Biking', href: '#', icon: BikeIcon },
			{ label: 'Sailing', href: '#', icon: SailboatIcon },
			{ label: 'Hiking', href: '#', icon: MountainIcon }
		],
		relaxation: [
			{ label: 'Lounge', href: '#', icon: TreePalmIcon },
			{ label: 'Spa', href: '#', icon: BubblesIcon },
			{ label: 'Sleep', href: '#', icon: BedDoubleIcon }
		]
	};

	let layoutRail = $.state(true);

	function toggleLayout() {
		$.set(layoutRail, !$.get(layoutRail));
	}

	var div = root_4();
	var section = $.sibling($.child(div), 2);
	var div_1 = $.sibling($.child(section), 2);
	var node = $.sibling($.child(div_1), 2);

	Navigation(node, {
		layout: 'bar',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Navigation.Menu, ($$anchor, Navigation_Menu) => {
				Navigation_Menu($$anchor, {
					class: 'grid grid-cols-4 gap-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 16, () => links, (link) => link, ($$anchor, link) => {
							const Icon = $.derived(() => link.icon);
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor) => {
								Navigation_TriggerAnchor($$anchor, {
									class: 'Anchor',
									get href() {
										return link.href;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => $.get(Icon), ($$anchor, Icon_1) => {
											Icon_1($$anchor, { class: 'size-5' });
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText) => {
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

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_2 = $.sibling($.child(section_1), 2);
	var node_6 = $.child(div_2);

	Navigation(node_6, {
		layout: 'rail',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_1();
			var node_7 = $.first_child(fragment_5);

			$.component(node_7, () => Navigation.Header, ($$anchor, Navigation_Header) => {
				Navigation_Header($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_8 = $.first_child(fragment_6);

						$.component(node_8, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_1) => {
							Navigation_TriggerAnchor_1($$anchor, {
								href: '/',
								title: 'View Homepage',
								'aria-label': 'View Homepage',
								children: ($$anchor, $$slotProps) => {
									SkullIcon($$anchor, { class: 'size-8' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node_7, 2);

			$.component(node_9, () => Navigation.Content, ($$anchor, Navigation_Content) => {
				Navigation_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_10 = $.first_child(fragment_8);

						$.component(node_10, () => Navigation.Menu, ($$anchor, Navigation_Menu_1) => {
							Navigation_Menu_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_11 = $.first_child(fragment_9);

									$.each(node_11, 16, () => links, (link) => link, ($$anchor, link) => {
										const Icon = $.derived(() => link.icon);
										var fragment_10 = $.comment();
										var node_12 = $.first_child(fragment_10);

										$.component(node_12, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_2) => {
											Navigation_TriggerAnchor_2($$anchor, {
												class: 'Anchor',
												get href() {
													return link.href;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root();
													var node_13 = $.first_child(fragment_11);

													$.component(node_13, () => $.get(Icon), ($$anchor, Icon_2) => {
														Icon_2($$anchor, { class: 'size-6' });
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_1) => {
														Navigation_TriggerText_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, link.label));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_9, 2);

			$.component(node_15, () => Navigation.Footer, ($$anchor, Navigation_Footer) => {
				Navigation_Footer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = $.comment();
						var node_16 = $.first_child(fragment_13);

						$.component(node_16, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_3) => {
							Navigation_TriggerAnchor_3($$anchor, {
								href: '/',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$anchor, $$slotProps) => {
									SettingsIcon($$anchor, { class: 'size-6' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_2);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_3 = $.sibling($.child(section_2), 2);
	var node_17 = $.child(div_3);

	Navigation(node_17, {
		layout: 'sidebar',
		class: 'grid grid-rows-[auto_1fr_auto] gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_1();
			var node_18 = $.first_child(fragment_15);

			$.component(node_18, () => Navigation.Header, ($$anchor, Navigation_Header_1) => {
				Navigation_Header_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var a = root_2();
						var node_19 = $.child(a);

						SkullIcon(node_19, { class: 'size-6' });
						$.reset(a);
						$.append($$anchor, a);
					},
					$$slots: { default: true }
				});
			});

			var node_20 = $.sibling(node_18, 2);

			$.component(node_20, () => Navigation.Content, ($$anchor, Navigation_Content_1) => {
				Navigation_Content_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_16 = root();
						var node_21 = $.first_child(fragment_16);

						$.component(node_21, () => Navigation.Group, ($$anchor, Navigation_Group) => {
							Navigation_Group($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = $.comment();
									var node_22 = $.first_child(fragment_17);

									$.component(node_22, () => Navigation.Menu, ($$anchor, Navigation_Menu_2) => {
										Navigation_Menu_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = $.comment();
												var node_23 = $.first_child(fragment_18);

												$.component(node_23, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_4) => {
													Navigation_TriggerAnchor_4($$anchor, {
														href: '/',
														children: ($$anchor, $$slotProps) => {
															var fragment_19 = root();
															var node_24 = $.first_child(fragment_19);

															HouseIcon(node_24, { class: 'size-4' });

															var node_25 = $.sibling(node_24, 2);

															$.component(node_25, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_2) => {
																Navigation_TriggerText_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Home');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_19);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						var node_26 = $.sibling(node_21, 2);

						$.each(node_26, 17, () => Object.entries(linksSidebar), $.index, ($$anchor, $$item, $$index_3, $$array) => {
							var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
							let category = () => $.get($$array_1)[0];
							let links = () => $.get($$array_1)[1];
							var fragment_20 = $.comment();
							var node_27 = $.first_child(fragment_20);

							$.component(node_27, () => Navigation.Group, ($$anchor, Navigation_Group_1) => {
								Navigation_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root();
										var node_28 = $.first_child(fragment_21);

										$.component(node_28, () => Navigation.Label, ($$anchor, Navigation_Label) => {
											Navigation_Label($$anchor, {
												class: 'capitalize pl-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text();

													$.template_effect(() => $.set_text(text_3, category()));
													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_28, 2);

										$.component(node_29, () => Navigation.Menu, ($$anchor, Navigation_Menu_3) => {
											Navigation_Menu_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_23 = $.comment();
													var node_30 = $.first_child(fragment_23);

													$.each(node_30, 16, links, (link) => link, ($$anchor, link) => {
														const Icon = $.derived(() => link.icon);
														var fragment_24 = $.comment();
														var node_31 = $.first_child(fragment_24);

														$.component(node_31, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_5) => {
															Navigation_TriggerAnchor_5($$anchor, {
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
																	var fragment_25 = root();
																	var node_32 = $.first_child(fragment_25);

																	$.component(node_32, () => $.get(Icon), ($$anchor, Icon_3) => {
																		Icon_3($$anchor, { class: 'size-4' });
																	});

																	var node_33 = $.sibling(node_32, 2);

																	$.component(node_33, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_3) => {
																		Navigation_TriggerText_3($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text();

																				$.template_effect(() => $.set_text(text_4, link.label));
																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_25);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_24);
													});

													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_20);
						});

						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});
			});

			var node_34 = $.sibling(node_20, 2);

			$.component(node_34, () => Navigation.Footer, ($$anchor, Navigation_Footer_1) => {
				Navigation_Footer_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_27 = $.comment();
						var node_35 = $.first_child(fragment_27);

						$.component(node_35, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_6) => {
							Navigation_TriggerAnchor_6($$anchor, {
								href: '/',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$anchor, $$slotProps) => {
									var fragment_28 = root();
									var node_36 = $.first_child(fragment_28);

									SettingsIcon(node_36, { class: 'size-4' });

									var node_37 = $.sibling(node_36, 2);

									$.component(node_37, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_4) => {
										Navigation_TriggerText_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Settings');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_28);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_27);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_3);
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var pre = $.sibling($.child(section_3), 2);
	var text_6 = $.only_child(pre);
	var div_4 = $.sibling(pre, 2);
	var node_38 = $.child(div_4);

	{
		let $0 = $.derived(() => $.get(layoutRail) ? 'rail' : 'sidebar');
		let $1 = $.derived(() => $.get(layoutRail) ? '' : 'grid grid-rows-[1fr_auto] gap-4');

		Navigation(node_38, {
			get layout() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_29 = root();
				var node_39 = $.first_child(fragment_29);

				$.component(node_39, () => Navigation.Content, ($$anchor, Navigation_Content_2) => {
					Navigation_Content_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_30 = $.comment();
							var node_40 = $.first_child(fragment_30);

							$.component(node_40, () => Navigation.Menu, ($$anchor, Navigation_Menu_4) => {
								Navigation_Menu_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_31 = $.comment();
										var node_41 = $.first_child(fragment_31);

										$.each(node_41, 16, () => links, (link) => link, ($$anchor, link) => {
											const Icon = $.derived(() => link.icon);
											var fragment_32 = $.comment();
											var node_42 = $.first_child(fragment_32);

											$.component(node_42, () => Navigation.TriggerAnchor, ($$anchor, Navigation_TriggerAnchor_7) => {
												Navigation_TriggerAnchor_7($$anchor, {
													get href() {
														return link.href;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_33 = root();
														var node_43 = $.first_child(fragment_33);

														{
															let $0 = $.derived(() => $.get(layoutRail) ? 'size-6' : 'size-4');

															$.component(node_43, () => $.get(Icon), ($$anchor, Icon_4) => {
																Icon_4($$anchor, {
																	get class() {
																		return $.get($0);
																	}
																});
															});
														}

														var node_44 = $.sibling(node_43, 2);

														$.component(node_44, () => Navigation.TriggerText, ($$anchor, Navigation_TriggerText_5) => {
															Navigation_TriggerText_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text();

																	$.template_effect(() => $.set_text(text_7, link.label));
																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_33);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_32);
										});

										$.append($$anchor, fragment_31);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_30);
						},
						$$slots: { default: true }
					});
				});

				var node_45 = $.sibling(node_39, 2);

				$.component(node_45, () => Navigation.Footer, ($$anchor, Navigation_Footer_2) => {
					Navigation_Footer_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_35 = $.comment();
							var node_46 = $.first_child(fragment_35);

							$.component(node_46, () => Navigation.Trigger, ($$anchor, Navigation_Trigger) => {
								Navigation_Trigger($$anchor, {
									onclick: toggleLayout,
									children: ($$anchor, $$slotProps) => {
										var fragment_36 = root();
										var node_47 = $.first_child(fragment_36);

										{
											let $0 = $.derived(() => $.get(layoutRail) ? 'size-6' : 'size-4');

											ArrowLeftRightIcon(node_47, {
												get class() {
													return $.get($0);
												}
											});
										}

										var node_48 = $.sibling(node_47, 2);

										{
											var consequent = ($$anchor) => {
												var span = root_3();

												$.append($$anchor, span);
											};

											$.if(node_48, ($$render) => {
												if (!$.get(layoutRail)) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_36);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_35);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_29);
			},
			$$slots: { default: true }
		});
	}

	$.next(2);
	$.reset(div_4);
	$.reset(section_3);
	$.reset(div);
	$.template_effect(() => $.set_text(text_6, `Layout: ${$.get(layoutRail) ? 'Rail' : 'Sidebar'}`));
	$.append($$anchor, div);
}