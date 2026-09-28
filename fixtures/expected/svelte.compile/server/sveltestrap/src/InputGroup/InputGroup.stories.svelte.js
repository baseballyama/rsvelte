import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { InputGroupText, Input } from '@sveltestrap/sveltestrap';
import InputGroup from './InputGroup.svelte';

export const meta = {
	title: 'Stories/InputGroup',
	component: InputGroup,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
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
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: { size: '', theme: null }
};

export default function InputGroup_stories($$renderer) {
	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="form-width">`);

				InputGroup($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							InputGroupText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->@`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							Input($$renderer, { placeholder: 'username' });
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
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Groups',
		children: ($$renderer) => {
			$$renderer.push(`<div class="form-width">`);

			InputGroup($$renderer, {
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								addon: true,
								type: 'checkbox',
								'aria-label': 'Checkbox for following text input'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { placeholder: 'Check it out' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			InputGroup($$renderer, {
				children: ($$renderer) => {
					Input($$renderer, { placeholder: 'placeholder email' });
					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->@example.com`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			InputGroup($$renderer, {
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { placeholder: 'Dolla dolla billz yo!' });
					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			InputGroup($$renderer, {
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						placeholder: 'Amount',
						min: 0,
						max: 100,
						type: 'number',
						step: '1'
					});

					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->.00`);
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
		name: 'Size',
		children: ($$renderer) => {
			$$renderer.push(`<div class="form-width"><div>`);

			InputGroup($$renderer, {
				size: 'lg',
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->@lg`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			InputGroup($$renderer, {
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->@default`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			InputGroup($$renderer, {
				size: 'sm',
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->@sm`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, {});
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
			$$renderer.push(`<div class="form-width vertical gap-lg">`);

			InputGroup($$renderer, {
				theme: 'dark',
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								addon: true,
								type: 'checkbox',
								'aria-label': 'Checkbox for following text input'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { placeholder: 'Check it out' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InputGroup($$renderer, {
				theme: 'light',
				children: ($$renderer) => {
					Input($$renderer, { placeholder: 'placeholder email' });
					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->@example.com`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InputGroup($$renderer, {
				theme: 'dark',
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { placeholder: 'Dolla dolla billz yo!' });
					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InputGroup($$renderer, {
				theme: 'light',
				children: ($$renderer) => {
					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->$`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						placeholder: 'Amount',
						min: 0,
						max: 100,
						type: 'number',
						step: '1'
					});

					$$renderer.push(`<!----> `);

					InputGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->.00`);
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