import * as $ from 'svelte/internal/server';
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

import Dropdown from './Dropdown.svelte';

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

export default function Dropdown_stories($$renderer) {
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

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="dropdown-example"><div class="drop-height">`);

				Dropdown($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								color: 'primary',
								caret: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Drop${$.escape(args.direction)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenu($$renderer, {
								children: ($$renderer) => {
									DropdownItem($$renderer, {
										header: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Header`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Some Action`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										disabled: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Action (disabled)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									DropdownItem($$renderer, { divider: true });
									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Foo Action`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Bar Action`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Quo Action`);
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
					}
				]));

				$$renderer.push(`<!----></div></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic', source: basicSource });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Alignment',
		children: ($$renderer) => {
			$$renderer.push(`<div class="dropdown-example"><div class="drop-height">`);

			Dropdown($$renderer, {
				children: ($$renderer) => {
					DropdownToggle($$renderer, {
						color: 'primary',
						caret: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dropdown's menu is right-aligned`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenu($$renderer, {
						end: true,
						children: ($$renderer) => {
							DropdownItem($$renderer, {
								header: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Header`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
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

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Direction',
		children: ($$renderer) => {
			$$renderer.push(`<div class="dropdown-example"><div class="horizontal drop-height"><!--[-->`);

			const each_array = $.ensure_array_like(directions);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let direction = each_array[$$index];

				Dropdown($$renderer, {
					direction,
					children: ($$renderer) => {
						DropdownToggle($$renderer, {
							color: 'primary',
							caret: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Drop${$.escape(direction)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownMenu($$renderer, {
							children: ($$renderer) => {
								DropdownItem($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Another Action`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								DropdownItem($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Another Action`);
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
			}

			$$renderer.push(`<!--]--></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<div class="dropdown-example"><div class="horizontal drop-height"><!--[-->`);

			const each_array_1 = $.ensure_array_like(sizes);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let size = each_array_1[$$index_1];

				Dropdown($$renderer, {
					size,
					children: ($$renderer) => {
						DropdownToggle($$renderer, {
							color: 'primary',
							caret: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Dropdown ${$.escape(size)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownMenu($$renderer, {
							children: ($$renderer) => {
								DropdownItem($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Another Action`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								DropdownItem($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Another Action`);
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
			}

			$$renderer.push(`<!--]--></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Container',
		children: ($$renderer) => {
			$$renderer.push(`<div class="dropdown-example"><div class="drop-height">`);

			Dropdown($$renderer, {
				isOpen,
				toggle: () => isOpen = !isOpen,
				children: ($$renderer) => {
					DropdownToggle($$renderer, {
						tag: 'div',
						class: 'd-inline-block',
						children: ($$renderer) => {
							Input($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenu($$renderer, {
						children: ($$renderer) => {
							DropdownItem($$renderer, {
								header: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Header`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							DropdownItem($$renderer, { divider: true });
							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
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

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'SetActiveFromChild',
		children: ($$renderer) => {
			$$renderer.push(`<div class="dropdown-example"><div class="drop-height">`);

			Navbar($$renderer, {
				color: 'dark',
				dark: true,
				expand: 'md',
				children: ($$renderer) => {
					Nav($$renderer, {
						navbar: true,
						children: ($$renderer) => {
							NavItem($$renderer, {
								children: ($$renderer) => {
									NavLink($$renderer, {
										href: '/components/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Inactive Link`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dropdown($$renderer, {
								nav: true,
								setActiveFromChild: true,
								children: ($$renderer) => {
									DropdownToggle($$renderer, {
										nav: true,
										class: 'nav-link',
										caret: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Dropdown`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownMenu($$renderer, {
										children: ($$renderer) => {
											DropdownItem($$renderer, {
												href: '#',
												active: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Lancelot`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DropdownItem($$renderer, {
												href: '#',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Link`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DropdownItem($$renderer, {
												href: '#',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Secret`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DropdownItem($$renderer, {
												href: '#',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Chimp`);
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

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'AutoClose',
		children: ($$renderer) => {
			$$renderer.push(`<div class="dropdown-example"><div class="drop-height">`);

			ButtonToolbar($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="horizontal">`);

					Dropdown($$renderer, {
						autoClose: true,
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								color: 'primary',
								caret: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Default dropdown`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenu($$renderer, {
								children: ($$renderer) => {
									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
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

					$$renderer.push(`<!----> `);

					Dropdown($$renderer, {
						autoClose: 'outside',
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								color: 'success',
								caret: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Clickable inside`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenu($$renderer, {
								children: ($$renderer) => {
									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
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

					$$renderer.push(`<!----> `);

					Dropdown($$renderer, {
						autoClose: 'inside',
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								color: 'warning',
								caret: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Clickable outside`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenu($$renderer, {
								children: ($$renderer) => {
									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
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

					$$renderer.push(`<!----> `);

					Dropdown($$renderer, {
						autoClose: false,
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								color: 'danger',
								caret: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Manually close`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenu($$renderer, {
								children: ($$renderer) => {
									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Menu item`);
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

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal gap-xxl dropdown-example"><div class="drop-height">`);

			Dropdown($$renderer, {
				theme: 'dark',
				autoClose: 'manual',
				isOpen: true,
				children: ($$renderer) => {
					DropdownToggle($$renderer, {
						color: 'dark',
						caret: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dark Theme`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenu($$renderer, {
						children: ($$renderer) => {
							DropdownItem($$renderer, {
								header: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Header`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							DropdownItem($$renderer, { divider: true });
							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
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

			$$renderer.push(`<!----></div> <div class="drop-height">`);

			Dropdown($$renderer, {
				theme: 'light',
				autoClose: 'manual',
				isOpen: true,
				children: ($$renderer) => {
					DropdownToggle($$renderer, {
						color: 'light',
						caret: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Light Theme`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenu($$renderer, {
						children: ($$renderer) => {
							DropdownItem($$renderer, {
								header: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Header`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							DropdownItem($$renderer, { divider: true });
							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
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

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}