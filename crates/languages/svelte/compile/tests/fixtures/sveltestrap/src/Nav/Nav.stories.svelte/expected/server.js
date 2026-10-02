import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	NavItem,
	Dropdown,
	DropdownItem,
	DropdownToggle,
	DropdownMenu,
	NavLink
} from '@sveltestrap/sveltestrap';

import Nav from './Nav.svelte';

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

export default function Nav_stories($$renderer) {
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

	Story($$renderer, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="nav-example"><p>List Based</p> `);

				Nav($$renderer, $.spread_props([
					args,
					{
						color: 'dark',
						children: ($$renderer) => {
							NavItem($$renderer, {
								active: true,
								children: ($$renderer) => {
									NavLink($$renderer, {
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Link`);
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
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Link`);
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
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Another Link`);
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
										disabled: true,
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Disabled Link`);
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

				$$renderer.push(`<!----> <hr/> <p>Link Based</p> `);

				Nav($$renderer, $.spread_props([
					args,
					{
						color: 'dark',
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLink($$renderer, {
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Tabs',
		children: ($$renderer) => {
			$$renderer.push(`<div class="nav-example tabs">`);

			Nav($$renderer, {
				tabs: true,
				children: ($$renderer) => {
					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Dropdown($$renderer, {
						nav: true,
						isOpen,
						toggle: () => isOpen = !isOpen,
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								nav: true,
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

					$$renderer.push(`<!----> `);

					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
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
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Pills',
		children: ($$renderer) => {
			$$renderer.push(`<div class="nav-example">`);

			Nav($$renderer, {
				pills: true,
				children: ($$renderer) => {
					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Dropdown($$renderer, {
						nav: true,
						isOpen,
						toggle: () => isOpen = !isOpen,
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								nav: true,
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

					$$renderer.push(`<!----> `);

					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
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
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Underline',
		children: ($$renderer) => {
			$$renderer.push(`<div class="nav-example">`);

			Nav($$renderer, {
				underline: true,
				children: ($$renderer) => {
					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Dropdown($$renderer, {
						nav: true,
						isOpen,
						toggle: () => isOpen = !isOpen,
						children: ($$renderer) => {
							DropdownToggle($$renderer, {
								nav: true,
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

					$$renderer.push(`<!----> `);

					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
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
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Vertical',
		children: ($$renderer) => {
			$$renderer.push(`<div class="nav-example"><p>List Based</p> `);

			Nav($$renderer, {
				vertical: true,
				children: ($$renderer) => {
					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
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
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
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

			$$renderer.push(`<!----> <hr/> <p>Link based</p> `);

			Nav($$renderer, {
				vertical: true,
				children: ($$renderer) => {
					NavLink($$renderer, {
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Link`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLink($$renderer, {
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Link`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLink($$renderer, {
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Another Link`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLink($$renderer, {
						disabled: true,
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled Link`);
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

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="nav-example">`);

			Nav($$renderer, {
				tabs: true,
				theme: 'dark',
				class: 'mb-3',
				children: ($$renderer) => {
					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
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
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
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

			Nav($$renderer, {
				tabs: true,
				theme: 'light',
				children: ($$renderer) => {
					NavItem($$renderer, {
						children: ($$renderer) => {
							NavLink($$renderer, {
								href: '#',
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Link`);
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
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Link`);
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
								disabled: true,
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled Link`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}