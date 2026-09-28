import 'svelte/internal/disclose-version';
import FormGroup from './FormGroup.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Badge, Form, Input } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<div class="form-width form-groups-example"><!></div>`);
var root_1 = $.from_html(`<option></option> <option>Alpha</option> <option>Bravo</option> <option>Charlie</option>`, 1);
var root_2 = $.from_html(`<div slot="label">Floating Label Slot <!></div>`);
var root_3 = $.from_html(`<div class="form-width"><!> <!> <!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function FormGroup_stories($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root();
				var node_1 = $.child(div);

				Form(node_1, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						FormGroup($$anchor, $.spread_props(() => $.get(args), {
							children: ($$anchor, $$slotProps) => {
								Input($$anchor, $.spread_props(() => $.get(args), { placeholder: 'Enter a value' }));
							},
							$$slots: { default: true }
						}));
					},
					$$slots: { default: true }
				}));

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Story(node_2, { name: 'Basic' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Floating',
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_3();
					var node_4 = $.child(div_1);

					FormGroup(node_4, {
						floating: true,
						label: 'Floating Label',
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, { placeholder: 'Enter a value' });
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					FormGroup(node_5, {
						floating: true,
						label: 'Select labels always float',
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, {
								type: 'select',
								placeholder: 'Enter a value',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var option = $.sibling($.first_child(fragment_6), 2);

									option.value = option.__value = 'alpha';

									var option_1 = $.sibling(option, 2);

									option_1.value = option_1.__value = 'bravo';

									var option_2 = $.sibling(option_1, 2);

									option_2.value = option_2.__value = 'charlie';
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					FormGroup(node_6, {
						floating: true,
						children: ($$anchor, $$slotProps) => {
							Input($$anchor, { placeholder: 'Enter a value' });
						},

						$$slots: {
							default: true,
							label: ($$anchor, $$slotProps) => {
								var div_2 = root_2();
								var node_7 = $.sibling($.child(div_2));

								Badge(node_7, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('3');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								$.reset(div_2);
								$.append($$anchor, div_2);
							}
						}
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}