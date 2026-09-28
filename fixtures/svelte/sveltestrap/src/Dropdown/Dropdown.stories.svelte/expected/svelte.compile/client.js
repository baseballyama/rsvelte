import 'svelte/internal/disclose-version';
import Dropdown from './Dropdown.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	ButtonToolbar,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	Input,
	Nav,
	NavItem,
	NavLink,
	Navbar
} from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Dropdown',
	component: Dropdown,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		active: { control: 'boolean' },
		autoClose: { control: 'boolean' },
		direction: {
			control: { type: 'select' },
			options: ['down', 'up', 'left', 'right', 'start', 'end'],
			table: { disable: true }
		},
		dropup: { control: 'boolean' },
		group: { control: 'boolean' },
		inNavbar: { control: 'boolean', table: { disable: true } },
		isOpen: { control: 'boolean' },
		nav: { control: 'boolean', table: { disable: true } },
		setActiveFromChild: { control: 'boolean', table: { disable: true } },
		size: { control: { type: 'select' }, options: ['sm', '', 'lg'] },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		toggle: { control: 'boolean', table: { disable: true } },
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		active: false,
		autoClose: true,
		direction: 'down',
		dropup: false,
		group: true,
		isOpen: false,
		nav: false,
		setActiveFromChild: false,
		size: '',
		theme: null,
		toggle: false
	}
};

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="dropdown-example"><div class="drop-height"><!></div></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="dropdown-example"><div class="horizontal drop-height"></div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="horizontal"><!> <!> <!> <!></div>`);
var root_8 = $.from_html(`<div class="horizontal gap-xxl dropdown-example"><div class="drop-height"><!></div> <div class="drop-height"><!></div></div>`);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_stories($$anchor) {
	let isOpen = false;
	const directions = ['down', 'up', 'left', 'right', 'start', 'end'];
	const sizes = ['sm', '', 'lg'];

	const basicSource = `<Dropdown direction="down">
  <DropdownToggle color="primary" caret>Dropdown</DropdownToggle>
  <DropdownMenu>
    <DropdownItem header>Header</DropdownItem>
    <DropdownItem>Some Action</DropdownItem>
    <DropdownItem disabled>Action (disabled)</DropdownItem>
    <DropdownItem divider />
    <DropdownItem>Foo Action</DropdownItem>
    <DropdownItem>Bar Action</DropdownItem>
    <DropdownItem>Quo Action</DropdownItem>
  </DropdownMenu>
</Dropdown>`;

	var fragment = root_9();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_2();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				Dropdown(node_1, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						DropdownToggle(node_2, {
							color: 'primary',
							caret: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `Drop${$.get(args).direction ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						DropdownMenu(node_3, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_4 = $.first_child(fragment_3);

								DropdownItem(node_4, {
									header: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Header');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								DropdownItem(node_5, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Some Action');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								DropdownItem(node_6, {
									disabled: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Action (disabled)');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_7 = $.sibling(node_6, 2);

								DropdownItem(node_7, { divider: true });

								var node_8 = $.sibling(node_7, 2);

								DropdownItem(node_8, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Foo Action');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								DropdownItem(node_9, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Bar Action');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								DropdownItem(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Quo Action');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_11 = $.sibling(node, 2);

	Story(node_11, { name: 'Basic', source: basicSource });

	var node_12 = $.sibling(node_11, 2);

	Story(node_12, {
		name: 'Alignment',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_2();
			var div_3 = $.child(div_2);
			var node_13 = $.child(div_3);

			Dropdown(node_13, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_14 = $.first_child(fragment_4);

					DropdownToggle(node_14, {
						color: 'primary',
						caret: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Dropdown\'s menu is right-aligned');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					DropdownMenu(node_15, {
						end: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_3();
							var node_16 = $.first_child(fragment_5);

							DropdownItem(node_16, {
								header: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Header');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							DropdownItem(node_17, {
								disabled: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Action');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							DropdownItem(node_18, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Another Action');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_12, 2);

	Story(node_19, {
		name: 'Direction',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_4();
			var div_5 = $.child(div_4);

			$.each(div_5, 21, () => directions, $.index, ($$anchor, direction) => {
				Dropdown($$anchor, {
					get direction() {
						return $.get(direction);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_20 = $.first_child(fragment_7);

						DropdownToggle(node_20, {
							color: 'primary',
							caret: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text();

								$.template_effect(() => $.set_text(text_11, `Drop${$.get(direction) ?? ''}`));
								$.append($$anchor, text_11);
							},
							$$slots: { default: true }
						});

						var node_21 = $.sibling(node_20, 2);

						DropdownMenu(node_21, {
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = root_1();
								var node_22 = $.first_child(fragment_9);

								DropdownItem(node_22, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text('Another Action');

										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});

								var node_23 = $.sibling(node_22, 2);

								DropdownItem(node_23, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text('Another Action');

										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_5);
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_19, 2);

	Story(node_24, {
		name: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_4();
			var div_7 = $.child(div_6);

			$.each(div_7, 21, () => sizes, $.index, ($$anchor, size) => {
				Dropdown($$anchor, {
					get size() {
						return $.get(size);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_1();
						var node_25 = $.first_child(fragment_11);

						DropdownToggle(node_25, {
							color: 'primary',
							caret: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_14 = $.text();

								$.template_effect(() => $.set_text(text_14, `Dropdown ${$.get(size) ?? ''}`));
								$.append($$anchor, text_14);
							},
							$$slots: { default: true }
						});

						var node_26 = $.sibling(node_25, 2);

						DropdownMenu(node_26, {
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = root_1();
								var node_27 = $.first_child(fragment_13);

								DropdownItem(node_27, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_15 = $.text('Another Action');

										$.append($$anchor, text_15);
									},
									$$slots: { default: true }
								});

								var node_28 = $.sibling(node_27, 2);

								DropdownItem(node_28, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_16 = $.text('Another Action');

										$.append($$anchor, text_16);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_24, 2);

	Story(node_29, {
		name: 'Container',
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_2();
			var div_9 = $.child(div_8);
			var node_30 = $.child(div_9);

			Dropdown(node_30, {
				get isOpen() {
					return isOpen;
				},
				toggle: () => isOpen = !isOpen,
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_1();
					var node_31 = $.first_child(fragment_14);

					DropdownToggle(node_31, {
						tag: 'div',
						class: 'd-inline-block',
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					DropdownMenu(node_32, {
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_5();
							var node_33 = $.first_child(fragment_16);

							DropdownItem(node_33, {
								header: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Header');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							DropdownItem(node_34, {
								disabled: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Action');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_35 = $.sibling(node_34, 2);

							DropdownItem(node_35, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Another Action');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							var node_36 = $.sibling(node_35, 2);

							DropdownItem(node_36, { divider: true });

							var node_37 = $.sibling(node_36, 2);

							DropdownItem(node_37, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('Another Action');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_29, 2);

	Story(node_38, {
		name: 'SetActiveFromChild',
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_2();
			var div_11 = $.child(div_10);
			var node_39 = $.child(div_11);

			Navbar(node_39, {
				color: 'dark',
				dark: true,
				expand: 'md',
				children: ($$anchor, $$slotProps) => {
					Nav($$anchor, {
						navbar: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_18 = root_1();
							var node_40 = $.first_child(fragment_18);

							NavItem(node_40, {
								children: ($$anchor, $$slotProps) => {
									NavLink($$anchor, {
										href: '/components/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text('Inactive Link');

											$.append($$anchor, text_21);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_41 = $.sibling(node_40, 2);

							Dropdown(node_41, {
								nav: true,
								setActiveFromChild: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root_1();
									var node_42 = $.first_child(fragment_20);

									DropdownToggle(node_42, {
										nav: true,
										class: 'nav-link',
										caret: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_22 = $.text('Dropdown');

											$.append($$anchor, text_22);
										},
										$$slots: { default: true }
									});

									var node_43 = $.sibling(node_42, 2);

									DropdownMenu(node_43, {
										children: ($$anchor, $$slotProps) => {
											var fragment_21 = root_6();
											var node_44 = $.first_child(fragment_21);

											DropdownItem(node_44, {
												href: '#',
												active: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_23 = $.text('Lancelot');

													$.append($$anchor, text_23);
												},
												$$slots: { default: true }
											});

											var node_45 = $.sibling(node_44, 2);

											DropdownItem(node_45, {
												href: '#',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_24 = $.text('Link');

													$.append($$anchor, text_24);
												},
												$$slots: { default: true }
											});

											var node_46 = $.sibling(node_45, 2);

											DropdownItem(node_46, {
												href: '#',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Secret');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});

											var node_47 = $.sibling(node_46, 2);

											DropdownItem(node_47, {
												href: '#',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_26 = $.text('Chimp');

													$.append($$anchor, text_26);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_21);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_11);
			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_48 = $.sibling(node_38, 2);

	Story(node_48, {
		name: 'AutoClose',
		children: ($$anchor, $$slotProps) => {
			var div_12 = root_2();
			var div_13 = $.child(div_12);
			var node_49 = $.child(div_13);

			ButtonToolbar(node_49, {
				children: ($$anchor, $$slotProps) => {
					var div_14 = root_7();
					var node_50 = $.child(div_14);

					Dropdown(node_50, {
						autoClose: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_22 = root_1();
							var node_51 = $.first_child(fragment_22);

							DropdownToggle(node_51, {
								color: 'primary',
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('Default dropdown');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});

							var node_52 = $.sibling(node_51, 2);

							DropdownMenu(node_52, {
								children: ($$anchor, $$slotProps) => {
									var fragment_23 = root_3();
									var node_53 = $.first_child(fragment_23);

									DropdownItem(node_53, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_28 = $.text('Menu item');

											$.append($$anchor, text_28);
										},
										$$slots: { default: true }
									});

									var node_54 = $.sibling(node_53, 2);

									DropdownItem(node_54, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_29 = $.text('Menu item');

											$.append($$anchor, text_29);
										},
										$$slots: { default: true }
									});

									var node_55 = $.sibling(node_54, 2);

									DropdownItem(node_55, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text('Menu item');

											$.append($$anchor, text_30);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_23);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_22);
						},
						$$slots: { default: true }
					});

					var node_56 = $.sibling(node_50, 2);

					Dropdown(node_56, {
						autoClose: 'outside',
						children: ($$anchor, $$slotProps) => {
							var fragment_24 = root_1();
							var node_57 = $.first_child(fragment_24);

							DropdownToggle(node_57, {
								color: 'success',
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_31 = $.text('Clickable inside');

									$.append($$anchor, text_31);
								},
								$$slots: { default: true }
							});

							var node_58 = $.sibling(node_57, 2);

							DropdownMenu(node_58, {
								children: ($$anchor, $$slotProps) => {
									var fragment_25 = root_3();
									var node_59 = $.first_child(fragment_25);

									DropdownItem(node_59, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_32 = $.text('Menu item');

											$.append($$anchor, text_32);
										},
										$$slots: { default: true }
									});

									var node_60 = $.sibling(node_59, 2);

									DropdownItem(node_60, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_33 = $.text('Menu item');

											$.append($$anchor, text_33);
										},
										$$slots: { default: true }
									});

									var node_61 = $.sibling(node_60, 2);

									DropdownItem(node_61, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_34 = $.text('Menu item');

											$.append($$anchor, text_34);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_25);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_24);
						},
						$$slots: { default: true }
					});

					var node_62 = $.sibling(node_56, 2);

					Dropdown(node_62, {
						autoClose: 'inside',
						children: ($$anchor, $$slotProps) => {
							var fragment_26 = root_1();
							var node_63 = $.first_child(fragment_26);

							DropdownToggle(node_63, {
								color: 'warning',
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_35 = $.text('Clickable outside');

									$.append($$anchor, text_35);
								},
								$$slots: { default: true }
							});

							var node_64 = $.sibling(node_63, 2);

							DropdownMenu(node_64, {
								children: ($$anchor, $$slotProps) => {
									var fragment_27 = root_3();
									var node_65 = $.first_child(fragment_27);

									DropdownItem(node_65, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_36 = $.text('Menu item');

											$.append($$anchor, text_36);
										},
										$$slots: { default: true }
									});

									var node_66 = $.sibling(node_65, 2);

									DropdownItem(node_66, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_37 = $.text('Menu item');

											$.append($$anchor, text_37);
										},
										$$slots: { default: true }
									});

									var node_67 = $.sibling(node_66, 2);

									DropdownItem(node_67, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_38 = $.text('Menu item');

											$.append($$anchor, text_38);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_27);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_26);
						},
						$$slots: { default: true }
					});

					var node_68 = $.sibling(node_62, 2);

					Dropdown(node_68, {
						autoClose: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_28 = root_1();
							var node_69 = $.first_child(fragment_28);

							DropdownToggle(node_69, {
								color: 'danger',
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_39 = $.text('Manually close');

									$.append($$anchor, text_39);
								},
								$$slots: { default: true }
							});

							var node_70 = $.sibling(node_69, 2);

							DropdownMenu(node_70, {
								children: ($$anchor, $$slotProps) => {
									var fragment_29 = root_3();
									var node_71 = $.first_child(fragment_29);

									DropdownItem(node_71, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_40 = $.text('Menu item');

											$.append($$anchor, text_40);
										},
										$$slots: { default: true }
									});

									var node_72 = $.sibling(node_71, 2);

									DropdownItem(node_72, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_41 = $.text('Menu item');

											$.append($$anchor, text_41);
										},
										$$slots: { default: true }
									});

									var node_73 = $.sibling(node_72, 2);

									DropdownItem(node_73, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_42 = $.text('Menu item');

											$.append($$anchor, text_42);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_29);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_28);
						},
						$$slots: { default: true }
					});

					$.reset(div_14);
					$.append($$anchor, div_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);
			$.reset(div_12);
			$.append($$anchor, div_12);
		},
		$$slots: { default: true }
	});

	var node_74 = $.sibling(node_48, 2);

	Story(node_74, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_15 = root_8();
			var div_16 = $.child(div_15);
			var node_75 = $.child(div_16);

			Dropdown(node_75, {
				theme: 'dark',
				autoClose: 'manual',
				isOpen: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_30 = root_1();
					var node_76 = $.first_child(fragment_30);

					DropdownToggle(node_76, {
						color: 'dark',
						caret: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_43 = $.text('Dark Theme');

							$.append($$anchor, text_43);
						},
						$$slots: { default: true }
					});

					var node_77 = $.sibling(node_76, 2);

					DropdownMenu(node_77, {
						children: ($$anchor, $$slotProps) => {
							var fragment_31 = root_5();
							var node_78 = $.first_child(fragment_31);

							DropdownItem(node_78, {
								header: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_44 = $.text('Header');

									$.append($$anchor, text_44);
								},
								$$slots: { default: true }
							});

							var node_79 = $.sibling(node_78, 2);

							DropdownItem(node_79, {
								disabled: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_45 = $.text('Action');

									$.append($$anchor, text_45);
								},
								$$slots: { default: true }
							});

							var node_80 = $.sibling(node_79, 2);

							DropdownItem(node_80, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_46 = $.text('Another Action');

									$.append($$anchor, text_46);
								},
								$$slots: { default: true }
							});

							var node_81 = $.sibling(node_80, 2);

							DropdownItem(node_81, { divider: true });

							var node_82 = $.sibling(node_81, 2);

							DropdownItem(node_82, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_47 = $.text('Another Action');

									$.append($$anchor, text_47);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_31);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_30);
				},
				$$slots: { default: true }
			});

			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var node_83 = $.child(div_17);

			Dropdown(node_83, {
				theme: 'light',
				autoClose: 'manual',
				isOpen: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_32 = root_1();
					var node_84 = $.first_child(fragment_32);

					DropdownToggle(node_84, {
						color: 'light',
						caret: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_48 = $.text('Light Theme');

							$.append($$anchor, text_48);
						},
						$$slots: { default: true }
					});

					var node_85 = $.sibling(node_84, 2);

					DropdownMenu(node_85, {
						children: ($$anchor, $$slotProps) => {
							var fragment_33 = root_5();
							var node_86 = $.first_child(fragment_33);

							DropdownItem(node_86, {
								header: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_49 = $.text('Header');

									$.append($$anchor, text_49);
								},
								$$slots: { default: true }
							});

							var node_87 = $.sibling(node_86, 2);

							DropdownItem(node_87, {
								disabled: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_50 = $.text('Action');

									$.append($$anchor, text_50);
								},
								$$slots: { default: true }
							});

							var node_88 = $.sibling(node_87, 2);

							DropdownItem(node_88, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_51 = $.text('Another Action');

									$.append($$anchor, text_51);
								},
								$$slots: { default: true }
							});

							var node_89 = $.sibling(node_88, 2);

							DropdownItem(node_89, { divider: true });

							var node_90 = $.sibling(node_89, 2);

							DropdownItem(node_90, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_52 = $.text('Another Action');

									$.append($$anchor, text_52);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_33);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_32);
				},
				$$slots: { default: true }
			});

			$.reset(div_17);
			$.reset(div_15);
			$.append($$anchor, div_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}