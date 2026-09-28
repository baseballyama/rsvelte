import 'svelte/internal/disclose-version';
import Navbar from './Navbar.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	Collapse,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem
} from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Navbar',
	component: Navbar,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		color: {
			control: { type: 'select' },
			options: [
				'',
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'light',
				'dark',
				'primary-subtle',
				'secondary-subtle',
				'success-subtle',
				'danger-subtle',
				'warning-subtle',
				'info-subtle',
				'light-subtle',
				'dark-subtle'
			]
		},
		container: {
			control: { type: 'select' },
			options: ['sm', 'md', 'lg', 'xl', 'xxl', 'fluid']
		},
		dark: { control: 'boolean' },
		expand: { control: '' },
		fixed: { control: '' },
		light: { control: 'boolean' },
		sticky: { control: '' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
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
		class: '',
		container: 'xl',
		color: 'light',
		dark: false,
		expand: 'md',
		fixed: '',
		light: true,
		sticky: '',
		theme: null
	}
};

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Navbar_stories($$anchor) {
	let isOpen = false;

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
	}

	const toggle = () => isOpen = !isOpen;
	const widths = ['sm', 'md', 'lg', 'xl', 'xxl', 'fluid'];

	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark',
		'primary-subtle',
		'secondary-subtle',
		'success-subtle',
		'danger-subtle',
		'warning-subtle',
		'info-subtle',
		'light-subtle',
		'dark-subtle'
	];

	var fragment = root_3();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Navbar($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						NavbarBrand(node_1, {
							href: '/',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('sveltestrap');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						NavbarToggler(node_2, { $$events: { click: () => isOpen = !isOpen } });

						var node_3 = $.sibling(node_2, 2);

						Collapse(node_3, {
							get isOpen() {
								return isOpen;
							},
							navbar: true,
							expand: 'md',
							$$events: { update: handleUpdate },
							children: ($$anchor, $$slotProps) => {
								Nav($$anchor, {
									class: 'ms-auto',
									navbar: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_4 = $.first_child(fragment_4);

										NavItem(node_4, {
											children: ($$anchor, $$slotProps) => {
												NavLink($$anchor, {
													href: '#components/',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Components');

														$.append($$anchor, text_1);
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
													href: 'https://github.com/sveltestrap/sveltestrap',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('GitHub');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										var node_6 = $.sibling(node_5, 2);

										Dropdown(node_6, {
											nav: true,
											inNavbar: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_1();
												var node_7 = $.first_child(fragment_7);

												DropdownToggle(node_7, {
													nav: true,
													caret: true,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Options');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});

												var node_8 = $.sibling(node_7, 2);

												DropdownMenu(node_8, {
													end: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root();
														var node_9 = $.first_child(fragment_8);

														DropdownItem(node_9, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Option 1');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});

														var node_10 = $.sibling(node_9, 2);

														DropdownItem(node_10, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Option 2');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});

														var node_11 = $.sibling(node_10, 2);

														DropdownItem(node_11, { divider: true });

														var node_12 = $.sibling(node_11, 2);

														DropdownItem(node_12, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Reset');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_13 = $.sibling(node, 2);

	Story(node_13, {
		name: 'Colors',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = $.comment();
			var node_14 = $.first_child(fragment_9);

			$.each(node_14, 17, () => colors, $.index, ($$anchor, color) => {
				{
					let $0 = $.derived(() => $.get(color) === 'dark' || $.get(color) === 'primary');
					let $1 = $.derived(() => $.get(color) !== 'dark' && $.get(color) !== 'primary');

					Navbar($$anchor, {
						get color() {
							return $.get(color);
						},

						get dark() {
							return $.get($0);
						},

						get light() {
							return $.get($1);
						},
						class: 'mb-2',
						children: ($$anchor, $$slotProps) => {
							NavbarBrand($$anchor, {
								href: '/',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text();

									$.template_effect(() => $.set_text(text_7, `${$.get(color) ?? ''} Navbar`));
									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_13, 2);

	Story(node_15, {
		name: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = $.comment();
			var node_16 = $.first_child(fragment_13);

			$.each(node_16, 17, () => widths, $.index, ($$anchor, width) => {
				Navbar($$anchor, {
					color: 'light',
					light: true,
					expand: 'md',
					get container() {
						return $.get(width);
					},
					class: 'mb-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_15 = root_2();
						var node_17 = $.first_child(fragment_15);

						NavbarBrand(node_17, {
							href: '/',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text();

								$.template_effect(() => $.set_text(text_8, `NavBar with ${$.get(width) ?? ''} container`));
								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});

						var node_18 = $.sibling(node_17, 2);

						NavbarToggler(node_18, { $$events: { click: () => isOpen = !isOpen } });

						var node_19 = $.sibling(node_18, 2);

						Collapse(node_19, {
							get isOpen() {
								return isOpen;
							},
							navbar: true,
							expand: 'md',
							$$events: { update: handleUpdate },
							children: ($$anchor, $$slotProps) => {
								Nav($$anchor, {
									class: 'ms-auto',
									navbar: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_18 = root_2();
										var node_20 = $.first_child(fragment_18);

										NavItem(node_20, {
											children: ($$anchor, $$slotProps) => {
												NavLink($$anchor, {
													href: '#components/',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Components');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										var node_21 = $.sibling(node_20, 2);

										NavItem(node_21, {
											children: ($$anchor, $$slotProps) => {
												NavLink($$anchor, {
													href: 'https://github.com/sveltestrap/sveltestrap',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('GitHub');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										var node_22 = $.sibling(node_21, 2);

										Dropdown(node_22, {
											nav: true,
											inNavbar: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_21 = root_1();
												var node_23 = $.first_child(fragment_21);

												DropdownToggle(node_23, {
													nav: true,
													caret: true,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text('Options');

														$.append($$anchor, text_11);
													},
													$$slots: { default: true }
												});

												var node_24 = $.sibling(node_23, 2);

												DropdownMenu(node_24, {
													end: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_22 = root();
														var node_25 = $.first_child(fragment_22);

														DropdownItem(node_25, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Option 1');

																$.append($$anchor, text_12);
															},
															$$slots: { default: true }
														});

														var node_26 = $.sibling(node_25, 2);

														DropdownItem(node_26, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_13 = $.text('Option 2');

																$.append($$anchor, text_13);
															},
															$$slots: { default: true }
														});

														var node_27 = $.sibling(node_26, 2);

														DropdownItem(node_27, { divider: true });

														var node_28 = $.sibling(node_27, 2);

														DropdownItem(node_28, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_14 = $.text('Reset');

																$.append($$anchor, text_14);
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_22);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_21);
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

						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_15, 2);

	Story(node_29, {
		name: 'Toggler',
		children: ($$anchor, $$slotProps) => {
			Navbar($$anchor, {
				color: 'light',
				light: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_24 = root_2();
					var node_30 = $.first_child(fragment_24);

					NavbarBrand(node_30, {
						href: '/',
						class: 'me-auto',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('sveltestrap');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					NavbarToggler(node_31, { class: 'me-2', $$events: { click: toggle } });

					var node_32 = $.sibling(node_31, 2);

					Collapse(node_32, {
						get isOpen() {
							return isOpen;
						},
						navbar: true,
						children: ($$anchor, $$slotProps) => {
							Nav($$anchor, {
								navbar: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_26 = root_1();
									var node_33 = $.first_child(fragment_26);

									NavItem(node_33, {
										children: ($$anchor, $$slotProps) => {
											NavLink($$anchor, {
												href: '#components/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Components');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_34 = $.sibling(node_33, 2);

									NavItem(node_34, {
										children: ($$anchor, $$slotProps) => {
											NavLink($$anchor, {
												href: 'https://github.com/sveltestrap/sveltestrap',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('GitHub');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_26);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_24);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_35 = $.sibling(node_29, 2);

	Story(node_35, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_29 = root_1();
			var node_36 = $.first_child(fragment_29);

			Navbar(node_36, {
				color: 'dark',
				theme: 'dark',
				children: ($$anchor, $$slotProps) => {
					var fragment_30 = root_2();
					var node_37 = $.first_child(fragment_30);

					NavbarBrand(node_37, {
						href: '/',
						class: 'me-auto',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('sveltestrap');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_38 = $.sibling(node_37, 2);

					NavbarToggler(node_38, { class: 'me-2', $$events: { click: toggle } });

					var node_39 = $.sibling(node_38, 2);

					Collapse(node_39, {
						get isOpen() {
							return isOpen;
						},
						navbar: true,
						children: ($$anchor, $$slotProps) => {
							Nav($$anchor, {
								navbar: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_32 = root_1();
									var node_40 = $.first_child(fragment_32);

									NavItem(node_40, {
										children: ($$anchor, $$slotProps) => {
											NavLink($$anchor, {
												href: '#components/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_19 = $.text('Components');

													$.append($$anchor, text_19);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_41 = $.sibling(node_40, 2);

									NavItem(node_41, {
										children: ($$anchor, $$slotProps) => {
											NavLink($$anchor, {
												href: 'https://github.com/sveltestrap/sveltestrap',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_20 = $.text('GitHub');

													$.append($$anchor, text_20);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_32);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_30);
				},
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_36, 2);

			Navbar(node_42, {
				color: 'light',
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_35 = root_2();
					var node_43 = $.first_child(fragment_35);

					NavbarBrand(node_43, {
						href: '/',
						class: 'me-auto',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('sveltestrap');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					NavbarToggler(node_44, { class: 'me-2', $$events: { click: toggle } });

					var node_45 = $.sibling(node_44, 2);

					Collapse(node_45, {
						get isOpen() {
							return isOpen;
						},
						navbar: true,
						children: ($$anchor, $$slotProps) => {
							Nav($$anchor, {
								navbar: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_37 = root_1();
									var node_46 = $.first_child(fragment_37);

									NavItem(node_46, {
										children: ($$anchor, $$slotProps) => {
											NavLink($$anchor, {
												href: '#components/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_22 = $.text('Components');

													$.append($$anchor, text_22);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_47 = $.sibling(node_46, 2);

									NavItem(node_47, {
										children: ($$anchor, $$slotProps) => {
											NavLink($$anchor, {
												href: 'https://github.com/sveltestrap/sveltestrap',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_23 = $.text('GitHub');

													$.append($$anchor, text_23);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_37);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_35);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_29);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}