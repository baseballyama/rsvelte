import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { ListGroupItem } from '@sveltestrap/sveltestrap';
import ListGroup from './ListGroup.svelte';

export const meta = {
	title: 'Stories/ListGroup',
	component: ListGroup,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		flush: { control: 'boolean' },
		horizontal: { control: 'boolean' },
		numbered: { control: 'boolean' },
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
		flush: false,
		horizontal: false,
		numbered: false,
		theme: null
	}
};

export default function ListGroup_stories($$renderer) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark'
	];

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="listgroup-example"><div class="listgroup-item-size">`);

				ListGroup($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							ListGroupItem($$renderer, {
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Active`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ListGroupItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bravo`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ListGroupItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Charlie`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ListGroupItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delta`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ListGroupItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Echo`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ListGroupItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled`);
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
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Colors',
		children: ($$renderer) => {
			$$renderer.push(`<div class="listgroup-example"><div class="listgroup-item-size">`);

			ListGroup($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(colors);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let color = each_array[$$index];

						ListGroupItem($$renderer, {
							color,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(color)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Actions',
		children: ($$renderer) => {
			$$renderer.push(`<div class="listgroup-example"><div class="listgroup-item-size"><h4 class="text-content">Anchors</h4> `);

			ListGroup($$renderer, {
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						active: true,
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bravo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Charlie`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delta`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						disabled: true,
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h4 class="mt-3 text-content">Buttons</h4> `);

			ListGroup($$renderer, {
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						active: true,
						tag: 'button',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'button',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bravo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'button',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Charlie`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'button',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delta`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						disabled: true,
						tag: 'button',
						action: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled`);
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
		name: 'Flush',
		children: ($$renderer) => {
			$$renderer.push(`<div class="listgroup-example"><div class="listgroup-item-size">`);

			ListGroup($$renderer, {
				flush: true,
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						disabled: true,
						tag: 'a',
						href: '#',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dapibus ac facilisis in`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Morbi leo risus`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: '#',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Porta ac consectetur ac`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						tag: 'a',
						href: '#',
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled`);
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
		name: 'Horizontal',
		children: ($$renderer) => {
			$$renderer.push(`<div class="listgroup-example"><div class="listgroup-item-size">`);

			ListGroup($$renderer, {
				horizontal: true,
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Ipsum`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dolor`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Amet`);
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
		name: 'Numbered',
		children: ($$renderer) => {
			$$renderer.push(`<div class="listgroup-example"><div class="listgroup-item-size">`);

			ListGroup($$renderer, {
				numbered: true,
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dapibus ac facilisis in`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Morbi leo risus`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Porta ac consectetur ac`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled`);
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
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="listgroup-example vertical gap-xxl"><div class="listgroup-item-size">`);

			ListGroup($$renderer, {
				theme: 'dark',
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bravo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'success',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Charlie`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'warning',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delta`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Echo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="listgroup-item-size">`);

			ListGroup($$renderer, {
				theme: 'light',
				children: ($$renderer) => {
					ListGroupItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bravo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'success',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Charlie`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'warning',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delta`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Echo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ListGroupItem($$renderer, {
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disabled`);
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