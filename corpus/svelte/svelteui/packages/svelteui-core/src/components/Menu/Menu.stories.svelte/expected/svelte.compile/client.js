import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Menu } from './index';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Divider } from '../Divider';
import { Center } from '../Center';
import { SimpleGrid } from '../SimpleGrid';
import { TextInput } from '../TextInput';
import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Start: <!>`, 1);
var root_3 = $.from_html(`Center: <!>`, 1);
var root_4 = $.from_html(`End: <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<li> </li>`);
var root_7 = $.from_html(`<!> <!> <ol></ol>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <!>`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Menu_stories($$anchor) {
	let menuEvents = [];
	let element;
	var fragment = root_10();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Menu',
		get component() {
			return Menu;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Menu($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Menu.Item, ($$anchor, Menu_Item) => {
							Menu_Item($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Basic Menu');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_3 = $.sibling(node_1, 2);

	Story(node_3, { name: 'Menu', id: 'menuStory' });

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'With Content',
		id: 'menuContentStory',
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_5 = $.first_child(fragment_4);

					$.component(node_5, () => Menu.Label, ($$anchor, Menu_Label) => {
						Menu_Label($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Application');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Menu.Item, ($$anchor, Menu_Item_1) => {
						Menu_Item_1($$anchor, {
							get icon() {
								return Gear;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Settings');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Menu.Item, ($$anchor, Menu_Item_2) => {
						Menu_Item_2($$anchor, {
							get icon() {
								return ChatBubble;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Messages');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item_3) => {
						Menu_Item_3($$anchor, {
							get icon() {
								return Camera;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Gallery');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Menu.Item, ($$anchor, Menu_Item_4) => {
						Menu_Item_4($$anchor, {
							get icon() {
								return MagnifyingGlass;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Search');

								$.append($$anchor, text_5);
							},

							$$slots: {
								default: true,
								rightSection: ($$anchor, $$slotProps) => {
									Kbd($$anchor, {
										slot: 'rightSection',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('⌘K');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								}
							}
						});
					});

					var node_10 = $.sibling(node_9, 2);

					Divider(node_10, {});

					var node_11 = $.sibling(node_10, 2);

					$.component(node_11, () => Menu.Label, ($$anchor, Menu_Label_1) => {
						Menu_Label_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Danger zone');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Menu.Item, ($$anchor, Menu_Item_5) => {
						Menu_Item_5($$anchor, {
							get icon() {
								return Width;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Transfer my data');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});
					});

					var node_13 = $.sibling(node_12, 2);

					$.component(node_13, () => Menu.Item, ($$anchor, Menu_Item_6) => {
						Menu_Item_6($$anchor, {
							color: 'red',
							get icon() {
								return Trash;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Delete my account');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_4, 2);

	Story(node_14, {
		name: 'Custom Control',
		id: 'menuCustomControlStory',
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_15 = $.first_child(fragment_7);

					$.component(node_15, () => Menu.Item, ($$anchor, Menu_Item_7) => {
						Menu_Item_7($$anchor, {
							get icon() {
								return Gear;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Settings');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});
					});

					var node_16 = $.sibling(node_15, 2);

					$.component(node_16, () => Menu.Item, ($$anchor, Menu_Item_8) => {
						Menu_Item_8($$anchor, {
							get icon() {
								return ChatBubble;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text('Messages');

								$.append($$anchor, text_11);
							},
							$$slots: { default: true }
						});
					});

					var node_17 = $.sibling(node_16, 2);

					$.component(node_17, () => Menu.Item, ($$anchor, Menu_Item_9) => {
						Menu_Item_9($$anchor, {
							get icon() {
								return Camera;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_12 = $.text('Gallery');

								$.append($$anchor, text_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				},

				$$slots: {
					default: true,
					control: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							slot: 'control',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Toggle Menu');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_14, 2);

	Story(node_18, {
		name: 'Custom placement',
		id: 'menuCustomPlacementStory',
		children: ($$anchor, $$slotProps) => {
			SimpleGrid($$anchor, {
				cols: 3,
				spacing: 100,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_5();
					var node_19 = $.first_child(fragment_10);

					Center(node_19, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_11 = root_2();
							var node_20 = $.sibling($.first_child(fragment_11));

							Menu(node_20, {
								placement: 'start',
								opened: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = $.comment();
									var node_21 = $.first_child(fragment_12);

									$.component(node_21, () => Menu.Item, ($$anchor, Menu_Item_10) => {
										Menu_Item_10($$anchor, {
											get icon() {
												return Gear;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Settings');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_19, 2);

					Center(node_22, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_13 = root_3();
							var node_23 = $.sibling($.first_child(fragment_13));

							Menu(node_23, {
								placement: 'center',
								opened: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = $.comment();
									var node_24 = $.first_child(fragment_14);

									$.component(node_24, () => Menu.Item, ($$anchor, Menu_Item_11) => {
										Menu_Item_11($$anchor, {
											get icon() {
												return Gear;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Settings');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_22, 2);

					Center(node_25, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_15 = root_4();
							var node_26 = $.sibling($.first_child(fragment_15));

							Menu(node_26, {
								placement: 'end',
								opened: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = $.comment();
									var node_27 = $.first_child(fragment_16);

									$.component(node_27, () => Menu.Item, ($$anchor, Menu_Item_12) => {
										Menu_Item_12($$anchor, {
											get icon() {
												return Gear;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_16 = $.text('Settings');

												$.append($$anchor, text_16);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_25, 2);

					Center(node_28, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_17 = root_2();
							var node_29 = $.sibling($.first_child(fragment_17));

							Menu(node_29, {
								placement: 'start',
								opened: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = $.comment();
									var node_30 = $.first_child(fragment_18);

									$.component(node_30, () => Menu.Item, ($$anchor, Menu_Item_13) => {
										Menu_Item_13($$anchor, {
											get icon() {
												return Gear;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_17 = $.text('Settings');

												$.append($$anchor, text_17);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_18);
								},

								$$slots: {
									default: true,
									control: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											slot: 'control',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_18 = $.text('Custom control');

												$.append($$anchor, text_18);
											},
											$$slots: { default: true }
										});
									}
								}
							});

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_28, 2);

					Center(node_31, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_20 = root_3();
							var node_32 = $.sibling($.first_child(fragment_20));

							Menu(node_32, {
								placement: 'center',
								opened: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_21 = $.comment();
									var node_33 = $.first_child(fragment_21);

									$.component(node_33, () => Menu.Item, ($$anchor, Menu_Item_14) => {
										Menu_Item_14($$anchor, {
											get icon() {
												return Gear;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_19 = $.text('Settings');

												$.append($$anchor, text_19);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_21);
								},

								$$slots: {
									default: true,
									control: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											slot: 'control',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_20 = $.text('Custom control');

												$.append($$anchor, text_20);
											},
											$$slots: { default: true }
										});
									}
								}
							});

							$.append($$anchor, fragment_20);
						},
						$$slots: { default: true }
					});

					var node_34 = $.sibling(node_31, 2);

					Center(node_34, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_23 = root_4();
							var node_35 = $.sibling($.first_child(fragment_23));

							Menu(node_35, {
								placement: 'end',
								opened: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = $.comment();
									var node_36 = $.first_child(fragment_24);

									$.component(node_36, () => Menu.Item, ($$anchor, Menu_Item_15) => {
										Menu_Item_15($$anchor, {
											get icon() {
												return Gear;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_21 = $.text('Settings');

												$.append($$anchor, text_21);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_24);
								},

								$$slots: {
									default: true,
									control: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											slot: 'control',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_22 = $.text('Custom control');

												$.append($$anchor, text_22);
											},
											$$slots: { default: true }
										});
									}
								}
							});

							$.append($$anchor, fragment_23);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_37 = $.sibling(node_18, 2);

	Story(node_37, {
		name: 'Event listeners',
		id: 'menuEventListenersStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_26 = root_7();
			var node_38 = $.first_child(fragment_26);

			Button(node_38, {
				$$events: { click: () => menuEvents = [...menuEvents, 'button click'] },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Test event');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var node_39 = $.sibling(node_38, 2);

			Menu(node_39, {
				$$events: {
					open: () => menuEvents = [...menuEvents, 'opened'],
					close: () => menuEvents = [...menuEvents, 'closed']
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_27 = $.comment();
					var node_40 = $.first_child(fragment_27);

					$.component(node_40, () => Menu.Item, ($$anchor, Menu_Item_16) => {
						Menu_Item_16($$anchor, {
							get icon() {
								return Gear;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_24 = $.text('Settings');

								$.append($$anchor, text_24);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_27);
				},

				$$slots: {
					default: true,
					control: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							slot: 'control',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_25 = $.text('Toggle menu');

								$.append($$anchor, text_25);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var ol = $.sibling(node_39, 2);

			$.each(ol, 21, () => menuEvents, $.index, ($$anchor, event) => {
				var li = root_6();
				var text_26 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_26, $.get(event)));
				$.append($$anchor, li);
			});

			$.reset(ol);
			$.append($$anchor, fragment_26);
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_37, 2);

	Story(node_41, {
		name: 'Menu with Input',
		id: 'menuWithInputStory',
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_30 = root_8();
					var node_42 = $.first_child(fragment_30);

					$.component(node_42, () => Menu.Item, ($$anchor, Menu_Item_17) => {
						Menu_Item_17($$anchor, {
							get icon() {
								return Gear;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_27 = $.text('Settings');

								$.append($$anchor, text_27);
							},
							$$slots: { default: true }
						});
					});

					var node_43 = $.sibling(node_42, 2);

					$.component(node_43, () => Menu.Item, ($$anchor, Menu_Item_18) => {
						Menu_Item_18($$anchor, {
							get icon() {
								return ChatBubble;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_28 = $.text('Messages');

								$.append($$anchor, text_28);
							},
							$$slots: { default: true }
						});
					});

					var node_44 = $.sibling(node_43, 2);

					$.component(node_44, () => Menu.Item, ($$anchor, Menu_Item_19) => {
						Menu_Item_19($$anchor, {
							get icon() {
								return Camera;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_29 = $.text('Gallery');

								$.append($$anchor, text_29);
							},
							$$slots: { default: true }
						});
					});

					var node_45 = $.sibling(node_44, 2);

					$.component(node_45, () => Menu.Label, ($$anchor, Menu_Label_2) => {
						Menu_Label_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								TextInput($$anchor, { placeholder: 'Search' });
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_30);
				},

				$$slots: {
					default: true,
					control: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							slot: 'control',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_30 = $.text('Toggle Menu');

								$.append($$anchor, text_30);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_46 = $.sibling(node_41, 2);

	Story(node_46, {
		name: 'Outside Toggle',
		id: 'menuOutsideToggleStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_33 = root_9();
			var node_47 = $.first_child(fragment_33);

			Button(node_47, {
				$$events: { click: () => element.toggle() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_31 = $.text('Toggle Menu');

					$.append($$anchor, text_31);
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_47, 2);

			$.bind_this(
				Menu(node_48, {
					children: ($$anchor, $$slotProps) => {
						var fragment_34 = root_1();
						var node_49 = $.first_child(fragment_34);

						$.component(node_49, () => Menu.Item, ($$anchor, Menu_Item_20) => {
							Menu_Item_20($$anchor, {
								get icon() {
									return Gear;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_32 = $.text('Settings');

									$.append($$anchor, text_32);
								},
								$$slots: { default: true }
							});
						});

						var node_50 = $.sibling(node_49, 2);

						$.component(node_50, () => Menu.Item, ($$anchor, Menu_Item_21) => {
							Menu_Item_21($$anchor, {
								get icon() {
									return ChatBubble;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_33 = $.text('Messages');

									$.append($$anchor, text_33);
								},
								$$slots: { default: true }
							});
						});

						var node_51 = $.sibling(node_50, 2);

						$.component(node_51, () => Menu.Item, ($$anchor, Menu_Item_22) => {
							Menu_Item_22($$anchor, {
								get icon() {
									return Camera;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_34 = $.text('Gallery');

									$.append($$anchor, text_34);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_34);
					},
					$$slots: { default: true }
				}),
				($$value) => element = $$value,
				() => element
			);

			$.append($$anchor, fragment_33);
		},
		$$slots: { default: true }
	});

	var node_52 = $.sibling(node_46, 2);

	Story(node_52, {
		name: 'Close on Item Click (false)',
		id: 'menuCloseOnItemClickStory',
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				closeOnItemClick: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_36 = root_1();
					var node_53 = $.first_child(fragment_36);

					$.component(node_53, () => Menu.Item, ($$anchor, Menu_Item_23) => {
						Menu_Item_23($$anchor, {
							get icon() {
								return Gear;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_35 = $.text('Settings');

								$.append($$anchor, text_35);
							},
							$$slots: { default: true }
						});
					});

					var node_54 = $.sibling(node_53, 2);

					$.component(node_54, () => Menu.Item, ($$anchor, Menu_Item_24) => {
						Menu_Item_24($$anchor, {
							get icon() {
								return ChatBubble;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_36 = $.text('Messages');

								$.append($$anchor, text_36);
							},
							$$slots: { default: true }
						});
					});

					var node_55 = $.sibling(node_54, 2);

					$.component(node_55, () => Menu.Item, ($$anchor, Menu_Item_25) => {
						Menu_Item_25($$anchor, {
							get icon() {
								return Camera;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_37 = $.text('Gallery');

								$.append($$anchor, text_37);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_36);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}