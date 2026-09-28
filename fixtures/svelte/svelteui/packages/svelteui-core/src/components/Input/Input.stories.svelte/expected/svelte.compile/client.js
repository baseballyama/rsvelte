import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Input } from './index';
import { EnvelopeClosed } from 'radix-icons-svelte';
import { Button } from '../Button';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_stories($$anchor) {
	let value = 'Hello';
	let valueNumber = 0;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Input',
		get component() {
			return Input;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Input($$anchor, $.spread_props(() => $.get(args), {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				}));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Input', id: 'inputStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Filled variant',
		id: 'inputFilledStory',
		args: { variant: 'filled' }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Unstyled variant',
		id: 'inputUnstyledStory',
		args: { variant: 'unstyled' }
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Number value',
		id: 'inputNumberStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_6 = $.first_child(fragment_2);

			Input(node_6, {
				type: 'number',
				get value() {
					return valueNumber;
				},

				set value($$value) {
					valueNumber = $$value;
				}
			});

			var text = $.sibling(node_6);

			$.template_effect(() => $.set_text(text, ` ${valueNumber ?? ''}
	${typeof valueNumber}`));

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 2);

	Story(node_7, {
		name: 'Invalid',
		id: 'inputInvalidStory',
		args: { invalid: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Story(node_8, {
		name: 'Disabled',
		id: 'inputDisabledStory',
		args: { disabled: true }
	});

	var node_9 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => ({ icon: EnvelopeClosed }));

		Story(node_9, {
			name: 'With icon',
			id: 'inputIconStory',
			get args() {
				return $.get($0);
			}
		});
	}

	var node_10 = $.sibling(node_9, 2);

	Story(node_10, {
		name: 'With icon (slot)',
		id: 'inputIconSlotStory',
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					icon: ($$anchor, $$slotProps) => {
						EnvelopeClosed($$anchor, {});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Story(node_11, {
		name: 'With right section',
		id: 'inputRightSectionStory',
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					rightSection: ($$anchor, $$slotProps) => {
						Button($$anchor, { $$events: { click: () => console.log('heelo') } });
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}