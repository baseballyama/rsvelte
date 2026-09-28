import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { ButtonGroup, ButtonToolbar } from '@sveltestrap/sveltestrap';
import Button from './Button.svelte';

export const meta = {
	title: 'Stories/Button',
	component: Button,
	parameters: { controls: { exclude: /^(click|default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		content: { control: '' },
		active: { control: 'boolean' },
		block: { control: 'boolean' },
		disabled: { control: 'boolean' },
		close: { control: 'boolean' },
		outline: { control: 'boolean' },
		href: { control: '' },
		value: { control: '' },
		inner: { control: false, table: { disable: true } },
		color: {
			control: { type: 'select' },
			options: [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'light',
				'dark',
				'link'
			]
		},
		size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
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
		active: false,
		block: false,
		content: undefined,
		close: false,
		color: 'secondary',
		disabled: false,
		href: '',
		inner: undefined,
		outline: false,
		size: null,
		value: ''
	}
};

export default function Button_stories($$renderer) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark',
		'link'
	];

	const sizesMap = { sm: 'Small', md: 'Medium', lg: 'Large' };

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Button($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Basic',
		args: { size: 'md', color: 'primary', content: 'Button' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Colors',
		args: { color: 'primary' },
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal capitalize"><!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Button($$renderer, {
					class: 'capitalize',
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(color)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Outlines',
		args: { color: 'primary' },
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array_1 = $.ensure_array_like(colors);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let color = each_array_1[$$index_1];

				Button($$renderer, {
					class: 'capitalize',
					outline: true,
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(color)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sizes',
		args: { size: 'md' },
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array_2 = $.ensure_array_like(Object.keys(sizesMap));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let size = each_array_2[$$index_2];

				Button($$renderer, {
					size,
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(sizesMap[size])}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Groups',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						color: 'primary',
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Alpha`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bravo`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Charlie`);
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
		name: 'Toolbar',
		children: ($$renderer) => {
			ButtonToolbar($$renderer, {
				children: ($$renderer) => {
					ButtonGroup($$renderer, {
						class: 'me-2',
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->4`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ButtonGroup($$renderer, {
						class: 'me-2',
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->5`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->6`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->7`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ButtonGroup($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->8`);
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
}