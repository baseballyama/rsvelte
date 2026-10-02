import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import RoundedCode from "$lib/../docs/ui/roundedCode.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { Menu, Tabs, Text } from "$lib/index.js";
import Pagination from "$lib/pagination/pagination.svelte";

import {
	menuAlignment,
	menuDefault,
	menuLinkItem,
	menuPrefixAndSuffix
} from "../../docs/data/menu.js";

import { MoreHorizontal, Accessibility, Webhook } from "$lib/icons/index.js";
import { fade } from "svelte/transition";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const menu = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
};

const defaultMenu = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_5();
			var node_2 = $.first_child(fragment_5);

			LinkH2(node_2, {
				href: '/menu#default',
				'aria-label': 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_2, 4);

			{
				const demo = ($$anchor) => {
					var div_5 = root_4();
					var node_3 = $.child(div_5);

					$.component(node_3, () => Menu.Root, ($$anchor, Menu_Root) => {
						Menu_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_3();
								var node_4 = $.first_child(fragment_6);

								$.component(node_4, () => Menu.Button, ($$anchor, Menu_Button) => {
									Menu_Button($$anchor, {
										'aria-controls': 'menu',
										'aria-expanded': 'false',
										'aria-haspopup': 'true',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Actions');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										id: 'menu',
										'aria-hidden': 'true',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_2();
											var node_6 = $.first_child(fragment_7);

											$.component(node_6, () => Menu.Item, ($$anchor, Menu_Item) => {
												Menu_Item($$anchor, {
													onClick: () => console.log("One"),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('One');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Menu.Item, ($$anchor, Menu_Item_1) => {
												Menu_Item_1($$anchor, {
													onClick: () => console.log("Two"),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Two');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item_2) => {
												Menu_Item_2($$anchor, {
													onClick: () => console.log("Three"),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('One');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => Menu.Link, ($$anchor, Menu_Link) => {
												Menu_Link($$anchor, {
													href: 'https://ui.kampsy.xyz',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Test for Link');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											var node_10 = $.sibling(node_9, 2);

											$.component(node_10, () => Menu.Item, ($$anchor, Menu_Item_3) => {
												Menu_Item_3($$anchor, {
													onClick: () => console.log("Delete"),
													type: 'error',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('Delete');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var node_11 = $.child(div_4);

				demoAndCode(node_11, () => demo, () => menuDefault);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const linkItem = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_7();
			var node_12 = $.first_child(fragment_9);

			LinkH2(node_12, {
				href: '/menu#link-item',
				'aria-label': 'link item',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('link item');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var div_6 = $.sibling(node_12, 2);

			{
				const demo = ($$anchor) => {
					var div_7 = root_4();
					var node_13 = $.child(div_7);

					$.component(node_13, () => Menu.Root, ($$anchor, Menu_Root_1) => {
						Menu_Root_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_3();
								var node_14 = $.first_child(fragment_10);

								$.component(node_14, () => Menu.Button, ($$anchor, Menu_Button_1) => {
									Menu_Button_1($$anchor, {
										'aria-controls': 'menu-2',
										'aria-expanded': 'false',
										'aria-haspopup': 'true',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Actions');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});
								});

								var node_15 = $.sibling(node_14, 2);

								$.component(node_15, () => Menu.Content, ($$anchor, Menu_Content_1) => {
									Menu_Content_1($$anchor, {
										id: 'menu-2',
										'aria-hidden': 'true',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = root_6();
											var node_16 = $.first_child(fragment_11);

											$.component(node_16, () => Menu.Link, ($$anchor, Menu_Link_1) => {
												Menu_Link_1($$anchor, {
													href: '/menu',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('One');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											});

											var node_17 = $.sibling(node_16, 2);

											$.component(node_17, () => Menu.Link, ($$anchor, Menu_Link_2) => {
												Menu_Link_2($$anchor, {
													href: '#/',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Two');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});
											});

											var node_18 = $.sibling(node_17, 2);

											$.component(node_18, () => Menu.Link, ($$anchor, Menu_Link_3) => {
												Menu_Link_3($$anchor, {
													href: '#/',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text('One');

														$.append($$anchor, text_11);
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
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				var node_19 = $.child(div_6);

				demoAndCode(node_19, () => demo, () => menuLinkItem);
				$.reset(div_6);
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
};

const defaultPrefixAndSuffix = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_9();
			var node_20 = $.first_child(fragment_13);

			LinkH2(node_20, {
				href: '/menu#prefix-and-suffix',
				'aria-label': 'prefix and suffix',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('prefix and suffix');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_20, 4);

			{
				const demo = ($$anchor) => {
					var div_9 = root_8();
					var node_21 = $.child(div_9);

					$.component(node_21, () => Menu.Root, ($$anchor, Menu_Root_2) => {
						Menu_Root_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_14 = root_3();
								var node_22 = $.first_child(fragment_14);

								$.component(node_22, () => Menu.Button, ($$anchor, Menu_Button_2) => {
									Menu_Button_2($$anchor, {
										shape: 'square',
										size: 'small',
										variant: 'secondary',
										svgOnly: true,
										'aria-label': 'Actions',
										'aria-controls': 'menu-3',
										'aria-expanded': 'false',
										'aria-haspopup': 'true',
										children: ($$anchor, $$slotProps) => {
											MoreHorizontal($$anchor, {});
										},
										$$slots: { default: true }
									});
								});

								var node_23 = $.sibling(node_22, 2);

								$.component(node_23, () => Menu.Content, ($$anchor, Menu_Content_2) => {
									Menu_Content_2($$anchor, {
										id: 'menu-3',
										'aria-hidden': 'true',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_16 = root_6();
											var node_24 = $.first_child(fragment_16);

											$.component(node_24, () => Menu.Item, ($$anchor, Menu_Item_4) => {
												Menu_Item_4($$anchor, {
													get prefix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_13 = $.text('Left');

														$.append($$anchor, text_13);
													},
													$$slots: { default: true }
												});
											});

											var node_25 = $.sibling(node_24, 2);

											$.component(node_25, () => Menu.Item, ($$anchor, Menu_Item_5) => {
												Menu_Item_5($$anchor, {
													get prefix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_14 = $.text('Center');

														$.append($$anchor, text_14);
													},
													$$slots: { default: true }
												});
											});

											var node_26 = $.sibling(node_25, 2);

											$.component(node_26, () => Menu.Item, ($$anchor, Menu_Item_6) => {
												Menu_Item_6($$anchor, {
													get prefix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_15 = $.text('Right');

														$.append($$anchor, text_15);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_14);
							},
							$$slots: { default: true }
						});
					});

					var node_27 = $.sibling(node_21, 2);

					$.component(node_27, () => Menu.Root, ($$anchor, Menu_Root_3) => {
						Menu_Root_3($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_17 = root_3();
								var node_28 = $.first_child(fragment_17);

								$.component(node_28, () => Menu.Button, ($$anchor, Menu_Button_3) => {
									Menu_Button_3($$anchor, {
										shape: 'square',
										size: 'small',
										variant: 'secondary',
										svgOnly: true,
										'aria-label': 'Actions',
										'aria-controls': 'menu-4',
										'aria-expanded': 'false',
										'aria-haspopup': 'true',
										children: ($$anchor, $$slotProps) => {
											MoreHorizontal($$anchor, {});
										},
										$$slots: { default: true }
									});
								});

								var node_29 = $.sibling(node_28, 2);

								$.component(node_29, () => Menu.Content, ($$anchor, Menu_Content_3) => {
									Menu_Content_3($$anchor, {
										id: 'menu-4',
										'aria-hidden': 'true',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_19 = root_6();
											var node_30 = $.first_child(fragment_19);

											$.component(node_30, () => Menu.Item, ($$anchor, Menu_Item_7) => {
												Menu_Item_7($$anchor, {
													get suffix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_16 = $.text('Left');

														$.append($$anchor, text_16);
													},
													$$slots: { default: true }
												});
											});

											var node_31 = $.sibling(node_30, 2);

											$.component(node_31, () => Menu.Item, ($$anchor, Menu_Item_8) => {
												Menu_Item_8($$anchor, {
													get suffix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_17 = $.text('Center');

														$.append($$anchor, text_17);
													},
													$$slots: { default: true }
												});
											});

											var node_32 = $.sibling(node_31, 2);

											$.component(node_32, () => Menu.Item, ($$anchor, Menu_Item_9) => {
												Menu_Item_9($$anchor, {
													get suffix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_18 = $.text('Right');

														$.append($$anchor, text_18);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_17);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var node_33 = $.child(div_8);

				demoAndCode(node_33, () => demo, () => menuPrefixAndSuffix);
				$.reset(div_8);
			}

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});
};

const alignment = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_21 = root_7();
			var node_34 = $.first_child(fragment_21);

			LinkH2(node_34, {
				href: '/menu#menu-alignment',
				'aria-label': 'menu alignment',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('menu alignment');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var div_10 = $.sibling(node_34, 2);

			{
				const demo = ($$anchor) => {
					var div_11 = root_10();
					var node_35 = $.child(div_11);

					$.component(node_35, () => Menu.Root, ($$anchor, Menu_Root_4) => {
						Menu_Root_4($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_22 = root_3();
								var node_36 = $.first_child(fragment_22);

								$.component(node_36, () => Menu.Button, ($$anchor, Menu_Button_4) => {
									Menu_Button_4($$anchor, {
										'aria-controls': 'menu-5',
										'aria-expanded': 'false',
										'aria-haspopup': 'true',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_20 = $.text('Actions');

											$.append($$anchor, text_20);
										},
										$$slots: { default: true }
									});
								});

								var node_37 = $.sibling(node_36, 2);

								$.component(node_37, () => Menu.Content, ($$anchor, Menu_Content_4) => {
									Menu_Content_4($$anchor, {
										id: 'menu-5',
										'aria-hidden': 'true',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_23 = root_6();
											var node_38 = $.first_child(fragment_23);

											$.component(node_38, () => Menu.Item, ($$anchor, Menu_Item_10) => {
												Menu_Item_10($$anchor, {
													get prefix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_21 = $.text('Left');

														$.append($$anchor, text_21);
													},
													$$slots: { default: true }
												});
											});

											var node_39 = $.sibling(node_38, 2);

											$.component(node_39, () => Menu.Item, ($$anchor, Menu_Item_11) => {
												Menu_Item_11($$anchor, {
													get prefix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_22 = $.text('Center');

														$.append($$anchor, text_22);
													},
													$$slots: { default: true }
												});
											});

											var node_40 = $.sibling(node_39, 2);

											$.component(node_40, () => Menu.Item, ($$anchor, Menu_Item_12) => {
												Menu_Item_12($$anchor, {
													get prefix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_23 = $.text('Right');

														$.append($$anchor, text_23);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_23);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_22);
							},
							$$slots: { default: true }
						});
					});

					var node_41 = $.sibling(node_35, 2);

					$.component(node_41, () => Menu.Root, ($$anchor, Menu_Root_5) => {
						Menu_Root_5($$anchor, {
							alignment: 'right',
							children: ($$anchor, $$slotProps) => {
								var fragment_24 = root_3();
								var node_42 = $.first_child(fragment_24);

								$.component(node_42, () => Menu.Button, ($$anchor, Menu_Button_5) => {
									Menu_Button_5($$anchor, {
										'aria-controls': 'menu-6',
										'aria-expanded': 'false',
										'aria-haspopup': 'true',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_24 = $.text('Actions');

											$.append($$anchor, text_24);
										},
										$$slots: { default: true }
									});
								});

								var node_43 = $.sibling(node_42, 2);

								$.component(node_43, () => Menu.Content, ($$anchor, Menu_Content_5) => {
									Menu_Content_5($$anchor, {
										id: 'menu-6',
										'aria-hidden': 'true',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_25 = root_6();
											var node_44 = $.first_child(fragment_25);

											$.component(node_44, () => Menu.Item, ($$anchor, Menu_Item_13) => {
												Menu_Item_13($$anchor, {
													get suffix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_25 = $.text('Left');

														$.append($$anchor, text_25);
													},
													$$slots: { default: true }
												});
											});

											var node_45 = $.sibling(node_44, 2);

											$.component(node_45, () => Menu.Item, ($$anchor, Menu_Item_14) => {
												Menu_Item_14($$anchor, {
													get suffix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_26 = $.text('Center');

														$.append($$anchor, text_26);
													},
													$$slots: { default: true }
												});
											});

											var node_46 = $.sibling(node_45, 2);

											$.component(node_46, () => Menu.Item, ($$anchor, Menu_Item_15) => {
												Menu_Item_15($$anchor, {
													get suffix() {
														return Accessibility;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_27 = $.text('Right');

														$.append($$anchor, text_27);
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
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				var node_47 = $.child(div_10);

				demoAndCode(node_47, () => demo, () => menuAlignment);
				$.reset(div_10);
			}

			$.append($$anchor, fragment_21);
		},
		$$slots: { default: true }
	});
};

const howItWorks = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_27 = root_15();
			var p = $.sibling($.first_child(fragment_27), 2);
			var node_48 = $.sibling($.child(p));

			RoundedCode(node_48, { text: 'Menu.Button' });

			var node_49 = $.sibling(node_48, 2);

			RoundedCode(node_49, { text: 'Menu.Button' });
			$.next();
			$.reset(p);

			var node_50 = $.sibling(p, 2);

			Text(node_50, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_28 = root_11();
					var node_51 = $.sibling($.first_child(fragment_28));

					RoundedCode(node_51, { text: 'aria-controls' });

					var node_52 = $.sibling(node_51, 2);

					RoundedCode(node_52, { text: 'Menu.Content' });
					$.next();
					$.append($$anchor, fragment_28);
				},
				$$slots: { default: true }
			});

			var node_53 = $.sibling(node_50, 2);

			Text(node_53, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_29 = root_12();
					var node_54 = $.sibling($.first_child(fragment_29));

					RoundedCode(node_54, { text: 'aria-expanded' });

					var node_55 = $.sibling(node_54, 2);

					RoundedCode(node_55, { text: 'Menu.Content' });
					$.next();
					$.append($$anchor, fragment_29);
				},
				$$slots: { default: true }
			});

			var node_56 = $.sibling(node_53, 2);

			Text(node_56, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_30 = root_13();
					var node_57 = $.sibling($.first_child(fragment_30));

					RoundedCode(node_57, { text: 'aria-haspopup' });
					$.next();
					$.append($$anchor, fragment_30);
				},
				$$slots: { default: true }
			});

			var node_58 = $.sibling(node_56, 2);

			Text(node_58, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_31 = root_14();
					var node_59 = $.sibling($.first_child(fragment_31));

					Text(node_59, {
						size: { sm: 12, md: 14, lg: 14 },
						class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text('The Enter and space keys opens the menu');

							$.append($$anchor, text_28);
						},
						$$slots: { default: true }
					});

					var node_60 = $.sibling(node_59, 2);

					Text(node_60, {
						size: { sm: 12, md: 14, lg: 14 },
						class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('The Escape closes the menu');

							$.append($$anchor, text_29);
						},
						$$slots: { default: true }
					});

					var node_61 = $.sibling(node_60, 2);

					Text(node_61, {
						size: { sm: 12, md: 14, lg: 14 },
						class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('When the menu is open, the Tab key will move through the menu items and once it leaves\n				the final item, the menu closes. AT will then announce the pop up has collapsed.');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_31);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_27);
		},
		$$slots: { default: true }
	});
};

const considerations = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_33 = root_16();

			$.next(2);
			$.append($$anchor, fragment_33);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "keyboard input", href: "/keyboard-input" },
				next: { title: "modal", href: "/modal" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">menu</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Dropdown menu opened via button. Supports keyboard navigation. The position will
			automatically adapt based on the window bounds.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="w-full"><!></div>`);
var root_5 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Menu extends the <a href="/button" class="underline">Button component.</a></p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_8 = $.from_html(`<div class="flex w-full gap-6"><!> <!></div>`);
var root_9 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The trigger is still wrapped by an unstyled button.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_10 = $.from_html(`<div class="flex w-full justify-between gap-8"><!> <!></div>`);
var root_11 = $.from_html(`An <!> attribute matching the id of the <!> containing the menu.`, 1);

var root_12 = $.from_html(
	`An <!> attribute, the value always being the opposite of the
			aria-hidden value on the <!>.`,
	1
);

var root_13 = $.from_html(`An <!> with the value of true.`, 1);
var root_14 = $.from_html(`Keyboard interaction: <!> <!> <!>`, 1);
var root_15 = $.from_html(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">How it works</h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The dropdown menu is a secondary menu which can be applied to <!>. The <!> contains a few aria-attributes:</p> <!> <!> <!> <!>`, 1);

var root_16 = $.from_html(
	`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Considerations</h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">This component aims to adhere to <a href="https://www.w3.org/TR/WCAG22/" class="text-kui-light-blue-900 dark:text-kui-dark-blue-900 underline">WCAG 2.2 (level AA)</a> guidelines. Ensure this compliance is maintained when the component is integrated into other
			projects.</p>`,
	1
);

var root_17 = $.from_html(`<section><!> <!> <!> <!></section>`);
var root_18 = $.from_html(`<section><!> <!></section>`);

export default function _page($$anchor) {
	const tabSnip = ($$anchor) => {
		Row($$anchor, {
			bottomLine: false,
			class: 'py-1!',
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => [
						{
							title: "Implementation",
							value: "implementation",
							icon: Webhook
						},

						{
							title: "Accessibility",
							value: "accessibility",
							icon: Accessibility
						}
					]);

					Tabs($$anchor, {
						get tabs() {
							return $.get($0);
						},

						get selected() {
							return $.get(selected);
						},

						set selected($$value) {
							$.set(selected, $$value, true);
						}
					});
				}
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_36 = root_2();
		var node_62 = $.first_child(fragment_36);

		menu(node_62);

		var node_63 = $.sibling(node_62, 2);

		tabSnip(node_63);

		var node_64 = $.sibling(node_63, 2);

		{
			var consequent = ($$anchor) => {
				var section = root_17();
				var node_65 = $.child(section);

				defaultMenu(node_65);

				var node_66 = $.sibling(node_65, 2);

				linkItem(node_66);

				var node_67 = $.sibling(node_66, 2);

				defaultPrefixAndSuffix(node_67);

				var node_68 = $.sibling(node_67, 2);

				alignment(node_68);
				$.reset(section);
				$.transition(3, section, () => fade);
				$.append($$anchor, section);
			};

			$.if(node_64, ($$render) => {
				if ($.get(selected) === "implementation") $$render(consequent);
			});
		}

		var node_69 = $.sibling(node_64, 2);

		{
			var consequent_1 = ($$anchor) => {
				var section_1 = root_18();
				var node_70 = $.child(section_1);

				howItWorks(node_70);

				var node_71 = $.sibling(node_70, 2);

				considerations(node_71);
				$.reset(section_1);
				$.transition(3, section_1, () => fade);
				$.append($$anchor, section_1);
			};

			$.if(node_69, ($$render) => {
				if ($.get(selected) === "accessibility") $$render(consequent_1);
			});
		}

		var node_72 = $.sibling(node_69, 2);

		prevAndNext(node_72);
		$.append($$anchor, fragment_36);
	};

	let selected = $.state("implementation");

	$.head('1uas024', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Menu';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}