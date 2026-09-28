import 'svelte/internal/disclose-version';
import Nav from './Nav.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	NavItem,
	Dropdown,
	DropdownItem,
	DropdownToggle,
	DropdownMenu,
	NavLink
} from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Nav',
	component: Nav,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		card: { control: 'boolean' },
		class: { control: false, table: { disable: true } },
		fill: { control: 'boolean' },
		horizontal: { control: '' },
		navbar: { control: 'boolean' },
		pills: { control: 'boolean' },
		tabs: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		underline: { control: 'boolean' },
		vertical: {
			control: { type: 'select' },
			options: ['', 'xs', 'sm', 'md', 'lg', 'xl']
		},
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
		card: false,
		class: '',
		fill: false,
		horizontal: '',
		justified: false,
		navbar: false,
		pills: false,
		tabs: false,
		theme: null,
		underline: false,
		vertical: ''
	}
};

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="nav-example"><p>List Based</p> <!> <hr/> <p>Link Based</p> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="nav-example tabs"><!></div>`);
var root_5 = $.from_html(`<div class="nav-example"><!></div>`);
var root_6 = $.from_html(`<div class="nav-example"><p>List Based</p> <!> <hr/> <p>Link based</p> <!></div>`);
var root_7 = $.from_html(`<div class="nav-example"><!> <!></div>`);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Nav_stories($$anchor) {
	let isOpen = false;

	let basicSource = `<script lang="ts">
  import { Nav, NavItem, NavLink } from '@sveltestrap/sveltestrap';
<\/script>

<p>List Based</p>

<Nav>
  <NavItem active>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Another Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink disabled href="#">Disabled Link</NavLink>
  </NavItem>
</Nav>

<hr />

<p>Link Based</p>

<Nav>
  <NavLink href="#" active>Link</NavLink>
  <NavLink href="#">Link</NavLink>
  <NavLink href="#">Another Link</NavLink>
  <NavLink disabled href="#">Disabled Link</NavLink>
</Nav>`;

	var fragment = root_8();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_1();
				var node_1 = $.sibling($.child(div), 2);

				Nav(node_1, $.spread_props(() => $.get(args), {
					color: 'dark',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						NavItem(node_2, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								NavLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Link');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						NavItem(node_3, {
							children: ($$anchor, $$slotProps) => {
								NavLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Link');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						NavItem(node_4, {
							children: ($$anchor, $$slotProps) => {
								NavLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Another Link');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						NavItem(node_5, {
							children: ($$anchor, $$slotProps) => {
								NavLink($$anchor, {
									disabled: true,
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Disabled Link');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));

				var node_6 = $.sibling(node_1, 6);

				Nav(node_6, $.spread_props(() => $.get(args), {
					color: 'dark',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root();
						var node_7 = $.first_child(fragment_6);

						NavLink(node_7, {
							href: '#',
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Link');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						NavLink(node_8, {
							href: '#',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Link');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						NavLink(node_9, {
							href: '#',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Another Link');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						var node_10 = $.sibling(node_9, 2);

						NavLink(node_10, {
							disabled: true,
							href: '#',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Disabled Link');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				}));

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_11 = $.sibling(node, 2);

	Story(node_11, {
		name: 'Tabs',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_4();
			var node_12 = $.child(div_1);

			Nav(node_12, {
				tabs: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_2();
					var node_13 = $.first_child(fragment_7);

					NavItem(node_13, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								active: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Link');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Dropdown(node_14, {
						nav: true,
						get isOpen() {
							return isOpen;
						},
						toggle: () => isOpen = !isOpen,
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_3();
							var node_15 = $.first_child(fragment_9);

							DropdownToggle(node_15, {
								nav: true,
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Dropdown');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							DropdownMenu(node_16, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_2();
									var node_17 = $.first_child(fragment_10);

									DropdownItem(node_17, {
										header: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('Header');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									DropdownItem(node_18, {
										disabled: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Action');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									DropdownItem(node_19, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Another Action');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									var node_20 = $.sibling(node_19, 2);

									DropdownItem(node_20, { divider: true });

									var node_21 = $.sibling(node_20, 2);

									DropdownItem(node_21, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_13 = $.text('Another Action');

											$.append($$anchor, text_13);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_14, 2);

					NavItem(node_22, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Link');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					NavItem(node_23, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('Another Link');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					NavItem(node_24, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								disabled: true,
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('Disabled Link');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_11, 2);

	Story(node_25, {
		name: 'Pills',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_5();
			var node_26 = $.child(div_2);

			Nav(node_26, {
				pills: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_2();
					var node_27 = $.first_child(fragment_14);

					NavItem(node_27, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								active: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Link');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_27, 2);

					Dropdown(node_28, {
						nav: true,
						get isOpen() {
							return isOpen;
						},
						toggle: () => isOpen = !isOpen,
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_3();
							var node_29 = $.first_child(fragment_16);

							DropdownToggle(node_29, {
								nav: true,
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Dropdown');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_30 = $.sibling(node_29, 2);

							DropdownMenu(node_30, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_2();
									var node_31 = $.first_child(fragment_17);

									DropdownItem(node_31, {
										header: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Header');

											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});

									var node_32 = $.sibling(node_31, 2);

									DropdownItem(node_32, {
										disabled: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_20 = $.text('Action');

											$.append($$anchor, text_20);
										},
										$$slots: { default: true }
									});

									var node_33 = $.sibling(node_32, 2);

									DropdownItem(node_33, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text('Another Action');

											$.append($$anchor, text_21);
										},
										$$slots: { default: true }
									});

									var node_34 = $.sibling(node_33, 2);

									DropdownItem(node_34, { divider: true });

									var node_35 = $.sibling(node_34, 2);

									DropdownItem(node_35, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_22 = $.text('Another Action');

											$.append($$anchor, text_22);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});

					var node_36 = $.sibling(node_28, 2);

					NavItem(node_36, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_23 = $.text('Link');

									$.append($$anchor, text_23);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_37 = $.sibling(node_36, 2);

					NavItem(node_37, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_24 = $.text('Another Link');

									$.append($$anchor, text_24);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_38 = $.sibling(node_37, 2);

					NavItem(node_38, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								disabled: true,
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_25 = $.text('Disabled Link');

									$.append($$anchor, text_25);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_39 = $.sibling(node_25, 2);

	Story(node_39, {
		name: 'Underline',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_5();
			var node_40 = $.child(div_3);

			Nav(node_40, {
				underline: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_21 = root_2();
					var node_41 = $.first_child(fragment_21);

					NavItem(node_41, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								active: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_26 = $.text('Link');

									$.append($$anchor, text_26);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_42 = $.sibling(node_41, 2);

					Dropdown(node_42, {
						nav: true,
						get isOpen() {
							return isOpen;
						},
						toggle: () => isOpen = !isOpen,
						children: ($$anchor, $$slotProps) => {
							var fragment_23 = root_3();
							var node_43 = $.first_child(fragment_23);

							DropdownToggle(node_43, {
								nav: true,
								caret: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('Dropdown');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});

							var node_44 = $.sibling(node_43, 2);

							DropdownMenu(node_44, {
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_2();
									var node_45 = $.first_child(fragment_24);

									DropdownItem(node_45, {
										header: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_28 = $.text('Header');

											$.append($$anchor, text_28);
										},
										$$slots: { default: true }
									});

									var node_46 = $.sibling(node_45, 2);

									DropdownItem(node_46, {
										disabled: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_29 = $.text('Action');

											$.append($$anchor, text_29);
										},
										$$slots: { default: true }
									});

									var node_47 = $.sibling(node_46, 2);

									DropdownItem(node_47, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text('Another Action');

											$.append($$anchor, text_30);
										},
										$$slots: { default: true }
									});

									var node_48 = $.sibling(node_47, 2);

									DropdownItem(node_48, { divider: true });

									var node_49 = $.sibling(node_48, 2);

									DropdownItem(node_49, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_31 = $.text('Another Action');

											$.append($$anchor, text_31);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_23);
						},
						$$slots: { default: true }
					});

					var node_50 = $.sibling(node_42, 2);

					NavItem(node_50, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_32 = $.text('Link');

									$.append($$anchor, text_32);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					NavItem(node_51, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_33 = $.text('Another Link');

									$.append($$anchor, text_33);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_52 = $.sibling(node_51, 2);

					NavItem(node_52, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								disabled: true,
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_34 = $.text('Disabled Link');

									$.append($$anchor, text_34);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_53 = $.sibling(node_39, 2);

	Story(node_53, {
		name: 'Vertical',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_6();
			var node_54 = $.sibling($.child(div_4), 2);

			Nav(node_54, {
				vertical: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_28 = root();
					var node_55 = $.first_child(fragment_28);

					NavItem(node_55, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_35 = $.text('Link');

									$.append($$anchor, text_35);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_56 = $.sibling(node_55, 2);

					NavItem(node_56, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_36 = $.text('Link');

									$.append($$anchor, text_36);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_57 = $.sibling(node_56, 2);

					NavItem(node_57, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_37 = $.text('Another Link');

									$.append($$anchor, text_37);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_58 = $.sibling(node_57, 2);

					NavItem(node_58, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								disabled: true,
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_38 = $.text('Disabled Link');

									$.append($$anchor, text_38);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_28);
				},
				$$slots: { default: true }
			});

			var node_59 = $.sibling(node_54, 6);

			Nav(node_59, {
				vertical: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_33 = root();
					var node_60 = $.first_child(fragment_33);

					NavLink(node_60, {
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_39 = $.text('Link');

							$.append($$anchor, text_39);
						},
						$$slots: { default: true }
					});

					var node_61 = $.sibling(node_60, 2);

					NavLink(node_61, {
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_40 = $.text('Link');

							$.append($$anchor, text_40);
						},
						$$slots: { default: true }
					});

					var node_62 = $.sibling(node_61, 2);

					NavLink(node_62, {
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_41 = $.text('Another Link');

							$.append($$anchor, text_41);
						},
						$$slots: { default: true }
					});

					var node_63 = $.sibling(node_62, 2);

					NavLink(node_63, {
						disabled: true,
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_42 = $.text('Disabled Link');

							$.append($$anchor, text_42);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_33);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_64 = $.sibling(node_53, 2);

	Story(node_64, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_7();
			var node_65 = $.child(div_5);

			Nav(node_65, {
				tabs: true,
				theme: 'dark',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_34 = root();
					var node_66 = $.first_child(fragment_34);

					NavItem(node_66, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								active: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_43 = $.text('Link');

									$.append($$anchor, text_43);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_67 = $.sibling(node_66, 2);

					NavItem(node_67, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_44 = $.text('Link');

									$.append($$anchor, text_44);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_68 = $.sibling(node_67, 2);

					NavItem(node_68, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_45 = $.text('Another Link');

									$.append($$anchor, text_45);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_69 = $.sibling(node_68, 2);

					NavItem(node_69, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								disabled: true,
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_46 = $.text('Disabled Link');

									$.append($$anchor, text_46);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_34);
				},
				$$slots: { default: true }
			});

			var node_70 = $.sibling(node_65, 2);

			Nav(node_70, {
				tabs: true,
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_39 = root();
					var node_71 = $.first_child(fragment_39);

					NavItem(node_71, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								active: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_47 = $.text('Link');

									$.append($$anchor, text_47);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_72 = $.sibling(node_71, 2);

					NavItem(node_72, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_48 = $.text('Link');

									$.append($$anchor, text_48);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_73 = $.sibling(node_72, 2);

					NavItem(node_73, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_49 = $.text('Another Link');

									$.append($$anchor, text_49);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_74 = $.sibling(node_73, 2);

					NavItem(node_74, {
						children: ($$anchor, $$slotProps) => {
							NavLink($$anchor, {
								disabled: true,
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_50 = $.text('Disabled Link');

									$.append($$anchor, text_50);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_39);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}