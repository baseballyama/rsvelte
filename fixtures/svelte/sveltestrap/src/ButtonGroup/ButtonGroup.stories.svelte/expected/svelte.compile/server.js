import * as $ from 'svelte/internal/server';
import { Story } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';
import ButtonGroup from './ButtonGroup.svelte';

export const meta = {
	title: 'Stories/ButtonGroup',
	component: ButtonGroup,
	parameters: { controls: { exclude: /^(click|default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
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
		outline: { control: 'boolean' },
		size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
		vertical: { control: 'boolean' },
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
		color: 'primary',
		outline: false,
		size: '',
		vertical: false
	}
};

export default function ButtonGroup_stories($$renderer) {
	const sizeMap = ['sm', 'md', 'lg'];
	const sizeToColorMap = { sm: 'primary', md: 'warning', lg: 'danger' };

	const basicSource = `
<ButtonGroup>
  <Button color="primary">Left</Button>
  <Button color="primary">Right</Button>
</ButtonGroup>
`;

	Story($$renderer, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args: argss }) => {
				ButtonGroup($$renderer, $.spread_props([
					argss,
					{
						children: ($$renderer) => {
							Button($$renderer, {
								color: argss.color,
								outline: argss.outline,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Left`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: argss.color,
								outline: argss.outline,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right`);
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
		name: 'Styles',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'warning',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Middle`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'success',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
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
		name: 'Outlines',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						color: 'primary',
						outline: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						outline: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Middle`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						outline: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
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
		name: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array = $.ensure_array_like(sizeMap);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let size = each_array[$$index];

				ButtonGroup($$renderer, {
					size,
					children: ($$renderer) => {
						Button($$renderer, {
							color: sizeToColorMap[size],
							children: ($$renderer) => {
								$$renderer.push(`<!---->Left`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							color: sizeToColorMap[size],
							children: ($$renderer) => {
								$$renderer.push(`<!---->Middle`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							color: sizeToColorMap[size],
							children: ($$renderer) => {
								$$renderer.push(`<!---->Right`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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
		name: 'Vertical',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				vertical: true,
				children: ($$renderer) => {
					Button($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Top`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Middle`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bottom`);
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