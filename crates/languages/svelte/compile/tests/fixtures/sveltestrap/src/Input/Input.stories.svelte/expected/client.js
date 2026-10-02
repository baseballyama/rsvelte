import 'svelte/internal/disclose-version';
import Input from './Input.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { FormGroup, FormText, Label } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<div class="form-width"><!></div>`);
var root_1 = $.from_html(`<div class="form-width"><div class="input-example"><div class="text-content"><!> <br/> <!> <br/> <!> <br/> <!> <br/> <!> <br/> <!> <br/> <!></div></div></div>`);
var root_2 = $.from_html(`<div class="form-width"><!> <br/><br/> <!></div>`);
var root_3 = $.from_html(`<div class="form-width"><!> <br/> <!> <br/> <!></div>`);
var root_4 = $.from_html(`<option> </option>`);
var root_5 = $.from_html(`<div class="form-width"><div class="input-example"><div class="text-content"><!> <br/> <!> <br/> <!> <br/> <!> <br/> <!></div></div></div>`);
var root_6 = $.from_html(`<div class="form-width"><!> <!></div>`);
var root_7 = $.from_html(`<div class="form-width"><!> <!> <!></div>`);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<p> </p>`);
var root_10 = $.from_html(`<div class="form-width"><div class="input-example"><!> <!> <!></div></div>`);
var root_11 = $.from_html(`<p><code>on:change</code> </p>`);
var root_12 = $.from_html(`<p><code>on:input</code> </p>`);
var root_13 = $.from_html(`<p><code>on:blur</code> says you are not focused.</p>`);
var root_14 = $.from_html(`<p><code>on:focus</code> says you are focused.</p>`);
var root_15 = $.from_html(`<div class="form-width"><div class="input-example"><!> <!> <!> <!></div></div>`);
var root_16 = $.from_html(`<div class="horizontal gap-xl form-width input-example"><div><!> <br/> <!> <br/> <!> <br/> <!> <br/> <!></div> <div><!> <br/> <!> <br/> <!> <br/> <!> <br/> <!></div></div>`);
var root_17 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_stories($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
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

	var fragment = root_17();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root();
				var node_1 = $.child(div);

				Input(node_1, $.spread_props(() => $.get(args)));
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Story(node_2, { name: 'Basic' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Text',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_4 = $.child(div_3);

			Input(node_4, {
				id: 'plainExample',
				plaintext: true,
				value: 'Some plain text/ static value'
			});

			var node_5 = $.sibling(node_4, 4);

			Input(node_5, { placeholder: 'text placeholder', value: 'Some text value' });

			var node_6 = $.sibling(node_5, 4);

			Input(node_6, { type: 'email', placeholder: 'email placeholder' });

			var node_7 = $.sibling(node_6, 4);

			Input(node_7, { type: 'password', placeholder: 'password placeholder' });

			var node_8 = $.sibling(node_7, 4);

			Input(node_8, { type: 'url', placeholder: 'url placeholder' });

			var node_9 = $.sibling(node_8, 4);

			Input(node_9, { type: 'search', placeholder: 'search placeholder' });

			var node_10 = $.sibling(node_9, 4);

			Input(node_10, { type: 'textarea', placeholder: 'textarea placeholder' });
			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_3, 2);

	Story(node_11, {
		name: 'Numbers',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_2();
			var node_12 = $.child(div_4);

			Input(node_12, {
				type: 'range',
				min: 0,
				max: 100,
				step: 10,
				placeholder: 'range placeholder'
			});

			var node_13 = $.sibling(node_12, 5);

			Input(node_13, { type: 'number', placeholder: 'number placeholder' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_11, 2);

	Story(node_14, {
		name: 'DateTime',
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_3();
			var node_15 = $.child(div_5);

			Input(node_15, { type: 'datetime-local', placeholder: 'datetime placeholder' });

			var node_16 = $.sibling(node_15, 4);

			Input(node_16, { type: 'date', placeholder: 'date placeholder' });

			var node_17 = $.sibling(node_16, 4);

			Input(node_17, { type: 'time', placeholder: 'time placeholder' });
			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_14, 2);

	Story(node_18, {
		name: 'Color',
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { type: 'color', placeholder: 'color placeholder' });
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Story(node_19, {
		name: 'SelectRadioCheckSwitch',
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_5();
			var div_7 = $.child(div_6);
			var div_8 = $.child(div_7);
			var node_20 = $.child(div_8);

			Input(node_20, {
				type: 'select',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_21 = $.first_child(fragment_2);

					$.each(node_21, 16, () => [1, 2, 3, 4, 5], $.index, ($$anchor, option) => {
						var option_1 = root_4();
						var text = $.only_child(option_1, true);
						var option_1_value = {};

						$.template_effect(() => {
							$.set_text(text, option);

							if (option_1_value !== (option_1_value = option)) {
								option_1.__value = option_1_value;
							}
						});

						$.append($$anchor, option_1);
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_20, 4);

			$.each(node_22, 16, () => ['eenie', 'meanie', 'minie', 'moe'], $.index, ($$anchor, value) => {
				{
					let $0 = $.derived(() => value.charAt(0).toUpperCase() + value.slice(1));

					Input($$anchor, {
						type: 'radio',
						get value() {
							return value;
						},

						get label() {
							return $.get($0);
						},

						get group() {
							return radioGroup;
						},

						set group($$value) {
							radioGroup = $$value;
						}
					});
				}
			});

			var node_23 = $.sibling(node_22, 4);

			Input(node_23, { type: 'checkbox', label: 'Check me out' });

			var node_24 = $.sibling(node_23, 4);

			Input(node_24, { type: 'checkbox', reverse: true, label: 'Reverse Label' });

			var node_25 = $.sibling(node_24, 4);

			Input(node_25, { type: 'switch', label: 'Switch me on' });
			$.reset(div_8);
			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_26 = $.sibling(node_19, 2);

	Story(node_26, {
		name: 'Files',
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_6();
			var node_27 = $.child(div_9);

			Input(node_27, { type: 'file', name: 'file', id: 'exampleFile' });

			var node_28 = $.sibling(node_27, 2);

			FormText(node_28, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('This is some placeholder block-level help text for the above input. It\'s a bit lighter and easily wraps to a new\n      line.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_26, 2);

	Story(node_29, {
		name: 'Validation',
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_7();
			var node_30 = $.child(div_10);

			FormGroup(node_30, {
				children: ($$anchor, $$slotProps) => {
					Input($$anchor, {
						value: 'Invalid input',
						invalid: true,
						feedback: 'I could be wrong'
					});
				},
				$$slots: { default: true }
			});

			var node_31 = $.sibling(node_30, 2);

			FormGroup(node_31, {
				children: ($$anchor, $$slotProps) => {
					Input($$anchor, {
						value: 'Valid input',
						valid: true,
						feedback: 'I could be right'
					});
				},
				$$slots: { default: true }
			});

			var node_32 = $.sibling(node_31, 2);

			FormGroup(node_32, {
				children: ($$anchor, $$slotProps) => {
					Input($$anchor, {
						value: 'Multiple feedback',
						valid: true,
						feedback: ['I could be here', 'I could be there']
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_33 = $.sibling(node_29, 2);

	Story(node_33, {
		name: 'Binding',
		children: ($$anchor, $$slotProps) => {
			var div_11 = root_10();
			var div_12 = $.child(div_11);
			var node_34 = $.child(div_12);

			FormGroup(node_34, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_8();
					var node_35 = $.first_child(fragment_7);

					Label(node_35, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Type here');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_36 = $.sibling(node_35, 2);

					Input(node_36, {
						type: 'text',
						get value() {
							return inputValue;
						},

						set value($$value) {
							inputValue = $$value;
						}
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_37 = $.sibling(node_34, 2);

			{
				var consequent = ($$anchor) => {
					var p = root_9();
					var text_3 = $.only_child(p);

					$.template_effect(() => $.set_text(text_3, `You typed: ${inputValue ?? ''}`));
					$.append($$anchor, p);
				};

				$.if(node_37, ($$render) => {
					if (inputValue) $$render(consequent);
				});
			}

			var node_38 = $.sibling(node_37, 2);

			FormGroup(node_38, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_8();
					var node_39 = $.first_child(fragment_8);

					Label(node_39, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('This textarea resizes as you type');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_40 = $.sibling(node_39, 2);

					Input(node_40, {
						rows: 1,
						type: 'textarea',
						get inner() {
							return inner;
						},

						set inner($$value) {
							inner = $$value;
						},
						$$events: { input: resize }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_12);
			$.reset(div_11);
			$.append($$anchor, div_11);
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_33, 2);

	Story(node_41, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var div_13 = root_15();
			var div_14 = $.child(div_13);
			var node_42 = $.child(div_14);

			FormGroup(node_42, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_8();
					var node_43 = $.first_child(fragment_9);

					Label(node_43, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Type here');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					Input(node_44, {
						type: 'text',
						get value() {
							return inputValue;
						},

						$$events: {
							blur: () => focused = false,
							focus: () => focused = true,
							change: changeEvent,
							input: inputEvent
						}
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_45 = $.sibling(node_42, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p_1 = root_11();
					var text_6 = $.sibling($.child(p_1));

					$.reset(p_1);
					$.template_effect(() => $.set_text(text_6, ` says you typed: ${changeValue ?? ''}`));
					$.append($$anchor, p_1);
				};

				$.if(node_45, ($$render) => {
					if (changeValue) $$render(consequent_1);
				});
			}

			var node_46 = $.sibling(node_45, 2);

			{
				var consequent_2 = ($$anchor) => {
					var p_2 = root_12();
					var text_7 = $.sibling($.child(p_2));

					$.reset(p_2);
					$.template_effect(() => $.set_text(text_7, ` says you are typing: ${inputValue ?? ''}`));
					$.append($$anchor, p_2);
				};

				$.if(node_46, ($$render) => {
					if (inputValue) $$render(consequent_2);
				});
			}

			var node_47 = $.sibling(node_46, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p_3 = root_13();

					$.append($$anchor, p_3);
				};

				var alternate = ($$anchor) => {
					var p_4 = root_14();

					$.append($$anchor, p_4);
				};

				$.if(node_47, ($$render) => {
					if (!focused) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.reset(div_14);
			$.reset(div_13);
			$.append($$anchor, div_13);
		},
		$$slots: { default: true }
	});

	var node_48 = $.sibling(node_41, 2);

	Story(node_48, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_15 = root_16();
			var div_16 = $.child(div_15);
			var node_49 = $.child(div_16);

			Input(node_49, {
				type: 'select',
				theme: 'dark',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = $.comment();
					var node_50 = $.first_child(fragment_10);

					$.each(node_50, 16, () => [1, 2, 3, 4, 5], $.index, ($$anchor, option) => {
						var option_2 = root_4();
						var text_8 = $.only_child(option_2, true);
						var option_2_value = {};

						$.template_effect(() => {
							$.set_text(text_8, option);

							if (option_2_value !== (option_2_value = option)) {
								option_2.__value = option_2_value;
							}
						});

						$.append($$anchor, option_2);
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_51 = $.sibling(node_49, 4);

			$.each(node_51, 16, () => ['eenie', 'meanie', 'minie', 'moe'], $.index, ($$anchor, value) => {
				{
					let $0 = $.derived(() => value.charAt(0).toUpperCase() + value.slice(1));

					Input($$anchor, {
						type: 'radio',
						theme: 'dark',
						get value() {
							return value;
						},

						get label() {
							return $.get($0);
						},

						get group() {
							return radioGroup;
						},

						set group($$value) {
							radioGroup = $$value;
						}
					});
				}
			});

			var node_52 = $.sibling(node_51, 4);

			Input(node_52, { theme: 'dark', type: 'checkbox', label: 'Check me out' });

			var node_53 = $.sibling(node_52, 4);

			Input(node_53, {
				theme: 'dark',
				type: 'checkbox',
				reverse: true,
				label: 'Reverse Label'
			});

			var node_54 = $.sibling(node_53, 4);

			Input(node_54, { theme: 'dark', type: 'switch', label: 'Switch me on' });
			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var node_55 = $.child(div_17);

			Input(node_55, {
				type: 'select',
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = $.comment();
					var node_56 = $.first_child(fragment_12);

					$.each(node_56, 16, () => [1, 2, 3, 4, 5], $.index, ($$anchor, option) => {
						var option_3 = root_4();
						var text_9 = $.only_child(option_3, true);
						var option_3_value = {};

						$.template_effect(() => {
							$.set_text(text_9, option);

							if (option_3_value !== (option_3_value = option)) {
								option_3.__value = option_3_value;
							}
						});

						$.append($$anchor, option_3);
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			var node_57 = $.sibling(node_55, 4);

			$.each(node_57, 16, () => ['eenie', 'meanie', 'minie', 'moe'], $.index, ($$anchor, value) => {
				{
					let $0 = $.derived(() => value.charAt(0).toUpperCase() + value.slice(1));

					Input($$anchor, {
						type: 'radio',
						theme: 'light',
						get value() {
							return value;
						},

						get label() {
							return $.get($0);
						},

						get group() {
							return radioGroup;
						},

						set group($$value) {
							radioGroup = $$value;
						}
					});
				}
			});

			var node_58 = $.sibling(node_57, 4);

			Input(node_58, { theme: 'light', type: 'checkbox', label: 'Check me out' });

			var node_59 = $.sibling(node_58, 4);

			Input(node_59, {
				theme: 'light',
				type: 'checkbox',
				reverse: true,
				label: 'Reverse Label'
			});

			var node_60 = $.sibling(node_59, 4);

			Input(node_60, { theme: 'light', type: 'switch', label: 'Switch me on' });
			$.reset(div_17);
			$.reset(div_15);
			$.append($$anchor, div_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}