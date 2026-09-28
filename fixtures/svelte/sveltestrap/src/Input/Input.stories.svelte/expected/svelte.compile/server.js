import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { FormGroup, FormText, Label } from '@sveltestrap/sveltestrap';
import Input from './Input.svelte';

export const meta = {
	title: 'Stories/Inputs',
	component: Input,
	parameters: {
		controls: {
			exclude: /^(blur|change|default|focus|input|keydown|keypress|keyup)$/g
		}
	},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		bsSize: { control: { type: 'select' }, options: ['sm', '', 'lg'] },
		type: {
			control: { type: 'select' },
			options: [
				'checkbox',
				'color',
				'date',
				'datetime-local',
				'email',
				'file',
				'number',
				'password',
				'radio',
				'range',
				'search',
				'select',
				'switch',
				'text',
				'textarea',
				'time',
				'url'
			]
		},
		plaintext: { control: { type: 'boolean' }, table: { disable: false } },
		size: {
			control: { type: 'select' },
			options: ['sm', 'lg'],
			table: { disable: true }
		},
		color: { control: 'color', table: { disable: true } },
		feedback: { control: 'text', table: { disable: true } },
		disabled: { control: 'boolean' },
		checked: { control: 'boolean', table: { disable: true } },
		files: { control: 'array', table: { disable: true } },
		group: { control: 'text', table: { disable: true } },
		inner: { control: 'text', table: { disable: true } },
		label: { control: 'text', table: { disable: true } },
		max: { control: 'number', table: { disable: true } },
		min: { control: 'number', table: { disable: true } },
		multiple: { control: 'boolean', table: { disable: true } },
		name: { control: 'text', table: { disable: true } },
		placeholder: { control: 'text' },
		readonly: { control: 'boolean', table: { disable: true } },
		reverse: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		value: { control: 'text' },
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
		bsSize: undefined,
		disabled: false,
		invalid: false,
		placeholder: 'placeholder',
		plaintext: false,
		reverse: false,
		theme: null,
		type: 'text',
		valid: false,
		value: ''
	}
};

export default function Input_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let changeValue = '';
		let focused = false;
		let inner = '';
		let inputValue = '';
		let radioGroup;

		const resize = () => {
			inner.style.height = 'auto';
			inner.style.height = 4 + inner.scrollHeight + 'px';
		};

		const changeEvent = (e) => {
			changeValue = e.target.value;
		};

		const inputEvent = (e) => {
			inputValue = e.target.value;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Template($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { args }) => {
						$$renderer.push(`<div class="form-width">`);
						Input($$renderer, $.spread_props([args]));
						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);
			Story($$renderer, { name: 'Basic' });
			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Text',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width"><div class="input-example"><div class="text-content">`);

					Input($$renderer, {
						id: 'plainExample',
						plaintext: true,
						value: 'Some plain text/ static value'
					});

					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { placeholder: 'text placeholder', value: 'Some text value' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'email', placeholder: 'email placeholder' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'password', placeholder: 'password placeholder' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'url', placeholder: 'url placeholder' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'search', placeholder: 'search placeholder' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'textarea', placeholder: 'textarea placeholder' });
					$$renderer.push(`<!----></div></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Numbers',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width">`);

					Input($$renderer, {
						type: 'range',
						min: 0,
						max: 100,
						step: 10,
						placeholder: 'range placeholder'
					});

					$$renderer.push(`<!----> <br/><br/> `);
					Input($$renderer, { type: 'number', placeholder: 'number placeholder' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'DateTime',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width">`);
					Input($$renderer, { type: 'datetime-local', placeholder: 'datetime placeholder' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'date', placeholder: 'date placeholder' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'time', placeholder: 'time placeholder' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Color',
				children: ($$renderer) => {
					Input($$renderer, { type: 'color', placeholder: 'color placeholder' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'SelectRadioCheckSwitch',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width"><div class="input-example"><div class="text-content">`);

					Input($$renderer, {
						type: 'select',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like([1, 2, 3, 4, 5]);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let option = each_array[$$index];

								$$renderer.option({}, option);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <br/> <!--[-->`);

					const each_array_1 = $.ensure_array_like(['eenie', 'meanie', 'minie', 'moe']);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let value = each_array_1[$$index_1];

						Input($$renderer, {
							type: 'radio',
							value,
							label: value.charAt(0).toUpperCase() + value.slice(1),
							get group() {
								return radioGroup;
							},

							set group($$value) {
								radioGroup = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]--> <br/> `);
					Input($$renderer, { type: 'checkbox', label: 'Check me out' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'checkbox', reverse: true, label: 'Reverse Label' });
					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { type: 'switch', label: 'Switch me on' });
					$$renderer.push(`<!----></div></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Files',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width">`);
					Input($$renderer, { type: 'file', name: 'file', id: 'exampleFile' });
					$$renderer.push(`<!----> `);

					FormText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is some placeholder block-level help text for the above input. It's a bit lighter and easily wraps to a new
      line.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Validation',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width">`);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								value: 'Invalid input',
								invalid: true,
								feedback: 'I could be wrong'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								value: 'Valid input',
								valid: true,
								feedback: 'I could be right'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Input($$renderer, {
								value: 'Multiple feedback',
								valid: true,
								feedback: ['I could be here', 'I could be there']
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Binding',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width"><div class="input-example">`);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Type here`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								type: 'text',
								get value() {
									return inputValue;
								},

								set value($$value) {
									inputValue = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (inputValue) {
						$$renderer.push(`<!--[0--><p>You typed: ${$.escape(inputValue)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This textarea resizes as you type`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								rows: 1,
								type: 'textarea',
								get inner() {
									return inner;
								},

								set inner($$value) {
									inner = $$value;
									$$settled = false;
								}
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
				name: 'Events',
				children: ($$renderer) => {
					$$renderer.push(`<div class="form-width"><div class="input-example">`);

					FormGroup($$renderer, {
						children: ($$renderer) => {
							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Type here`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							Input($$renderer, { type: 'text', value: inputValue });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (changeValue) {
						$$renderer.push(`<!--[0--><p><code>on:change</code> says you typed: ${$.escape(changeValue)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (inputValue) {
						$$renderer.push(`<!--[0--><p><code>on:input</code> says you are typing: ${$.escape(inputValue)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (!focused) {
						$$renderer.push(`<!--[0--><p><code>on:blur</code> says you are not focused.</p>`);
					} else {
						$$renderer.push(`<!--[-1--><p><code>on:focus</code> says you are focused.</p>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Story($$renderer, {
				name: 'Theming',
				children: ($$renderer) => {
					$$renderer.push(`<div class="horizontal gap-xl form-width input-example"><div>`);

					Input($$renderer, {
						type: 'select',
						theme: 'dark',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_2 = $.ensure_array_like([1, 2, 3, 4, 5]);

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let option = each_array_2[$$index_2];

								$$renderer.option({}, option);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <br/> <!--[-->`);

					const each_array_3 = $.ensure_array_like(['eenie', 'meanie', 'minie', 'moe']);

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let value = each_array_3[$$index_3];

						Input($$renderer, {
							type: 'radio',
							theme: 'dark',
							value,
							label: value.charAt(0).toUpperCase() + value.slice(1),
							get group() {
								return radioGroup;
							},

							set group($$value) {
								radioGroup = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]--> <br/> `);
					Input($$renderer, { theme: 'dark', type: 'checkbox', label: 'Check me out' });
					$$renderer.push(`<!----> <br/> `);

					Input($$renderer, {
						theme: 'dark',
						type: 'checkbox',
						reverse: true,
						label: 'Reverse Label'
					});

					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { theme: 'dark', type: 'switch', label: 'Switch me on' });
					$$renderer.push(`<!----></div> <div>`);

					Input($$renderer, {
						type: 'select',
						theme: 'light',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_4 = $.ensure_array_like([1, 2, 3, 4, 5]);

							for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
								let option = each_array_4[$$index_4];

								$$renderer.option({}, option);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <br/> <!--[-->`);

					const each_array_5 = $.ensure_array_like(['eenie', 'meanie', 'minie', 'moe']);

					for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
						let value = each_array_5[$$index_5];

						Input($$renderer, {
							type: 'radio',
							theme: 'light',
							value,
							label: value.charAt(0).toUpperCase() + value.slice(1),
							get group() {
								return radioGroup;
							},

							set group($$value) {
								radioGroup = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]--> <br/> `);
					Input($$renderer, { theme: 'light', type: 'checkbox', label: 'Check me out' });
					$$renderer.push(`<!----> <br/> `);

					Input($$renderer, {
						theme: 'light',
						type: 'checkbox',
						reverse: true,
						label: 'Reverse Label'
					});

					$$renderer.push(`<!----> <br/> `);
					Input($$renderer, { theme: 'light', type: 'switch', label: 'Switch me on' });
					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}