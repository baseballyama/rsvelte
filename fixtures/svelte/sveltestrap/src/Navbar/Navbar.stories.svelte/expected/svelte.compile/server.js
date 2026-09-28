import * as $ from 'svelte/internal/server';
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

import Navbar from './Navbar.svelte';

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

export default function Navbar_stories($$renderer) {
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

	Story($$renderer, {
		name: 'Basic',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Navbar($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							NavbarBrand($$renderer, {
								href: '/',
								children: ($$renderer) => {
									$$renderer.push(`<!---->sveltestrap`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							NavbarToggler($$renderer, {});
							$$renderer.push(`<!----> `);

							Collapse($$renderer, {
								isOpen,
								navbar: true,
								expand: 'md',
								children: ($$renderer) => {
									Nav($$renderer, {
										class: 'ms-auto',
										navbar: true,
										children: ($$renderer) => {
											NavItem($$renderer, {
												children: ($$renderer) => {
													NavLink($$renderer, {
														href: '#components/',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Components`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											NavItem($$renderer, {
												children: ($$renderer) => {
													NavLink($$renderer, {
														href: 'https://github.com/sveltestrap/sveltestrap',
														children: ($$renderer) => {
															$$renderer.push(`<!---->GitHub`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Dropdown($$renderer, {
												nav: true,
												inNavbar: true,
												children: ($$renderer) => {
													DropdownToggle($$renderer, {
														nav: true,
														caret: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Options`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													DropdownMenu($$renderer, {
														end: true,
														children: ($$renderer) => {
															DropdownItem($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Option 1`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															DropdownItem($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Option 2`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);
															DropdownItem($$renderer, { divider: true });
															$$renderer.push(`<!----> `);

															DropdownItem($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Reset`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Colors',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Navbar($$renderer, {
					color,
					dark: color === 'dark' || color === 'primary',
					light: color !== 'dark' && color !== 'primary',
					class: 'mb-2',
					children: ($$renderer) => {
						NavbarBrand($$renderer, {
							href: '/',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(color)} Navbar`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(widths);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let width = each_array_1[$$index_1];

				Navbar($$renderer, {
					color: 'light',
					light: true,
					expand: 'md',
					container: width,
					class: 'mb-2',
					children: ($$renderer) => {
						NavbarBrand($$renderer, {
							href: '/',
							children: ($$renderer) => {
								$$renderer.push(`<!---->NavBar with ${$.escape(width)} container`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						NavbarToggler($$renderer, {});
						$$renderer.push(`<!----> `);

						Collapse($$renderer, {
							isOpen,
							navbar: true,
							expand: 'md',
							children: ($$renderer) => {
								Nav($$renderer, {
									class: 'ms-auto',
									navbar: true,
									children: ($$renderer) => {
										NavItem($$renderer, {
											children: ($$renderer) => {
												NavLink($$renderer, {
													href: '#components/',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Components`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										NavItem($$renderer, {
											children: ($$renderer) => {
												NavLink($$renderer, {
													href: 'https://github.com/sveltestrap/sveltestrap',
													children: ($$renderer) => {
														$$renderer.push(`<!---->GitHub`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Dropdown($$renderer, {
											nav: true,
											inNavbar: true,
											children: ($$renderer) => {
												DropdownToggle($$renderer, {
													nav: true,
													caret: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Options`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												DropdownMenu($$renderer, {
													end: true,
													children: ($$renderer) => {
														DropdownItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Option 1`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														DropdownItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Option 2`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);
														DropdownItem($$renderer, { divider: true });
														$$renderer.push(`<!----> `);

														DropdownItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Reset`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Toggler',
		children: ($$renderer) => {
			Navbar($$renderer, {
				color: 'light',
				light: true,
				children: ($$renderer) => {
					NavbarBrand($$renderer, {
						href: '/',
						class: 'me-auto',
						children: ($$renderer) => {
							$$renderer.push(`<!---->sveltestrap`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					NavbarToggler($$renderer, { class: 'me-2' });
					$$renderer.push(`<!----> `);

					Collapse($$renderer, {
						isOpen,
						navbar: true,
						children: ($$renderer) => {
							Nav($$renderer, {
								navbar: true,
								children: ($$renderer) => {
									NavItem($$renderer, {
										children: ($$renderer) => {
											NavLink($$renderer, {
												href: '#components/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Components`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									NavItem($$renderer, {
										children: ($$renderer) => {
											NavLink($$renderer, {
												href: 'https://github.com/sveltestrap/sveltestrap',
												children: ($$renderer) => {
													$$renderer.push(`<!---->GitHub`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			Navbar($$renderer, {
				color: 'dark',
				theme: 'dark',
				children: ($$renderer) => {
					NavbarBrand($$renderer, {
						href: '/',
						class: 'me-auto',
						children: ($$renderer) => {
							$$renderer.push(`<!---->sveltestrap`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					NavbarToggler($$renderer, { class: 'me-2' });
					$$renderer.push(`<!----> `);

					Collapse($$renderer, {
						isOpen,
						navbar: true,
						children: ($$renderer) => {
							Nav($$renderer, {
								navbar: true,
								children: ($$renderer) => {
									NavItem($$renderer, {
										children: ($$renderer) => {
											NavLink($$renderer, {
												href: '#components/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Components`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									NavItem($$renderer, {
										children: ($$renderer) => {
											NavLink($$renderer, {
												href: 'https://github.com/sveltestrap/sveltestrap',
												children: ($$renderer) => {
													$$renderer.push(`<!---->GitHub`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Navbar($$renderer, {
				color: 'light',
				theme: 'light',
				children: ($$renderer) => {
					NavbarBrand($$renderer, {
						href: '/',
						class: 'me-auto',
						children: ($$renderer) => {
							$$renderer.push(`<!---->sveltestrap`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					NavbarToggler($$renderer, { class: 'me-2' });
					$$renderer.push(`<!----> `);

					Collapse($$renderer, {
						isOpen,
						navbar: true,
						children: ($$renderer) => {
							Nav($$renderer, {
								navbar: true,
								children: ($$renderer) => {
									NavItem($$renderer, {
										children: ($$renderer) => {
											NavLink($$renderer, {
												href: '#components/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Components`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									NavItem($$renderer, {
										children: ($$renderer) => {
											NavLink($$renderer, {
												href: 'https://github.com/sveltestrap/sveltestrap',
												children: ($$renderer) => {
													$$renderer.push(`<!---->GitHub`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}