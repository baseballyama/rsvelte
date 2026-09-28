import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Badge, Form, Input } from '@sveltestrap/sveltestrap';
import FormGroup from './FormGroup.svelte';

export const meta = {
	title: 'Stories/FormGroup',
	component: FormGroup,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		className: { control: 'text', table: { disable: true } },
		check: { control: 'boolean', table: { disable: true } },
		disabled: { control: 'boolean' },
		floating: { control: 'boolean' },
		inline: { control: 'boolean' },
		label: { control: 'text' },
		row: { control: 'boolean' },
		spacing: { control: 'text' },
		tag: {
			control: { type: 'select' },
			options: ['div', 'fieldset'],
			table: { disable: true }
		},
		'label ': {
			description: 'This slot is used for provided a custom label.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
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
		check: false,
		disabled: false,
		floating: false,
		inline: false,
		spacing: 'mb-3',
		label: '',
		row: false
	}
};

export default function FormGroup_stories($$renderer) {
	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="form-width form-groups-example">`);

				Form($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							FormGroup($$renderer, $.spread_props([
								args,
								{
									children: ($$renderer) => {
										Input($$renderer, $.spread_props([args, { placeholder: 'Enter a value' }]));
									},
									$$slots: { default: true }
								}
							]));
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Floating',
		children: ($$renderer) => {
			Form($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width">`);

					FormGroup($$renderer, {
						floating: true,
						label: 'Floating Label',
						children: ($$renderer) => {
							Input($$renderer, { placeholder: 'Enter a value' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FormGroup($$renderer, {
						floating: true,
						label: 'Select labels always float',
						children: ($$renderer) => {
							Input($$renderer, {
								type: 'select',
								placeholder: 'Enter a value',
								children: ($$renderer) => {
									$$renderer.option({}, ($$renderer) => {});
									$$renderer.push(` `);

									$$renderer.option({ value: 'alpha' }, ($$renderer) => {
										$$renderer.push(`Alpha`);
									});

									$$renderer.push(` `);

									$$renderer.option({ value: 'bravo' }, ($$renderer) => {
										$$renderer.push(`Bravo`);
									});

									$$renderer.push(` `);

									$$renderer.option({ value: 'charlie' }, ($$renderer) => {
										$$renderer.push(`Charlie`);
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FormGroup($$renderer, {
						floating: true,
						children: ($$renderer) => {
							Input($$renderer, { placeholder: 'Enter a value' });
						},

						$$slots: {
							default: true,
							label: ($$renderer) => {
								$$renderer.push(`<div slot="label">Floating Label Slot `);

								Badge($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->3`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}
						}
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}