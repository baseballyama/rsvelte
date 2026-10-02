import 'svelte/internal/disclose-version';
import InputGroup from './InputGroup.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { InputGroupText, Input } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="form-width"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="form-width"><!> <br/> <!> <br/> <!> <br/> <!></div>`);
var root_5 = $.from_html(`<div class="form-width"><div><!> <br/> <!> <br/> <!></div></div>`);
var root_6 = $.from_html(`<div class="form-width vertical gap-lg"><!> <!> <!> <!></div>`);

export default function InputGroup_stories($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_1();
				var node_1 = $.child(div);

				InputGroup(node_1, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						InputGroupText(node_2, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('@');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Input(node_3, { placeholder: 'username' });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	Story(node_4, { name: 'Basic' });

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Groups',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_4();
			var node_6 = $.child(div_1);

			InputGroup(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_7 = $.first_child(fragment_2);

					InputGroupText(node_7, {
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, {
								addon: true,
								type: 'checkbox',
								'aria-label': 'Checkbox for following text input'
							});
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Input(node_8, { placeholder: 'Check it out' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 4);

			InputGroup(node_9, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_10 = $.first_child(fragment_4);

					Input(node_10, { placeholder: 'placeholder email' });

					var node_11 = $.sibling(node_10, 2);

					InputGroupText(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('@example.com');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_9, 4);

			InputGroup(node_12, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_2();
					var node_13 = $.first_child(fragment_5);

					InputGroupText(node_13, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('$');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					InputGroupText(node_14, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('$');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Input(node_15, { placeholder: 'Dolla dolla billz yo!' });

					var node_16 = $.sibling(node_15, 2);

					InputGroupText(node_16, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('$');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					InputGroupText(node_17, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('$');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_12, 4);

			InputGroup(node_18, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_3();
					var node_19 = $.first_child(fragment_6);

					InputGroupText(node_19, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('$');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					Input(node_20, {
						placeholder: 'Amount',
						min: 0,
						max: 100,
						type: 'number',
						step: '1'
					});

					var node_21 = $.sibling(node_20, 2);

					InputGroupText(node_21, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('.00');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_5, 2);

	Story(node_22, {
		name: 'Size',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_5();
			var div_3 = $.child(div_2);
			var node_23 = $.child(div_3);

			InputGroup(node_23, {
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_24 = $.first_child(fragment_7);

					InputGroupText(node_24, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('@lg');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					Input(node_25, {});
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_23, 4);

			InputGroup(node_26, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_27 = $.first_child(fragment_8);

					InputGroupText(node_27, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('@default');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_27, 2);

					Input(node_28, {});
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_29 = $.sibling(node_26, 4);

			InputGroup(node_29, {
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root();
					var node_30 = $.first_child(fragment_9);

					InputGroupText(node_30, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('@sm');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					Input(node_31, {});
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_22, 2);

	Story(node_32, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_6();
			var node_33 = $.child(div_4);

			InputGroup(node_33, {
				theme: 'dark',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_34 = $.first_child(fragment_10);

					InputGroupText(node_34, {
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, {
								addon: true,
								type: 'checkbox',
								'aria-label': 'Checkbox for following text input'
							});
						},
						$$slots: { default: true }
					});

					var node_35 = $.sibling(node_34, 2);

					Input(node_35, { placeholder: 'Check it out' });
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_36 = $.sibling(node_33, 2);

			InputGroup(node_36, {
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root();
					var node_37 = $.first_child(fragment_12);

					Input(node_37, { placeholder: 'placeholder email' });

					var node_38 = $.sibling(node_37, 2);

					InputGroupText(node_38, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('@example.com');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			var node_39 = $.sibling(node_36, 2);

			InputGroup(node_39, {
				theme: 'dark',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_2();
					var node_40 = $.first_child(fragment_13);

					InputGroupText(node_40, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('$');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_41 = $.sibling(node_40, 2);

					InputGroupText(node_41, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('$');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_42 = $.sibling(node_41, 2);

					Input(node_42, { placeholder: 'Dolla dolla billz yo!' });

					var node_43 = $.sibling(node_42, 2);

					InputGroupText(node_43, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('$');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					InputGroupText(node_44, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('$');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			var node_45 = $.sibling(node_39, 2);

			InputGroup(node_45, {
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_3();
					var node_46 = $.first_child(fragment_14);

					InputGroupText(node_46, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('$');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					var node_47 = $.sibling(node_46, 2);

					Input(node_47, {
						placeholder: 'Amount',
						min: 0,
						max: 100,
						type: 'number',
						step: '1'
					});

					var node_48 = $.sibling(node_47, 2);

					InputGroupText(node_48, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('.00');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}