import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { EnvelopeClosed } from 'radix-icons-svelte';
import { NumberInput } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function NumberInput_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/NumberInput',
		get component() {
			return NumberInput;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				NumberInput($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'NumberInput', id: 'numberInputStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Decimals',
		id: 'numberInputDecimalsStory',
		args: { precision: 0.01, step: 0.01 }
	});

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => ({
			label: 'Price',
			placeholder: 'Your price',
			icon: EnvelopeClosed
		}));

		Story(node_4, {
			name: 'With icon',
			id: 'numberInputIconStory',
			get args() {
				return $.get($0);
			}
		});
	}

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'With icon (slot)',
		id: 'numbertInputIconSlotStory',
		children: ($$anchor, $$slotProps) => {
			NumberInput($$anchor, {
				label: 'Price',
				placeholder: 'Your price',
				$$slots: {
					icon: ($$anchor, $$slotProps) => {
						EnvelopeClosed($$anchor, {});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}