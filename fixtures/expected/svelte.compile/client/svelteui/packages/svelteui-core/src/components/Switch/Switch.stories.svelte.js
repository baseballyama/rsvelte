import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Switch } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Switch_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Switch',
		get component() {
			return Switch;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Switch($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Switch', id: 'switchStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Disabled',
		id: 'switchDisabledStory',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, { disabled: true });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'With label',
		id: 'switchLabelStory',
		args: { label: 'I would like to receive annoying notifications ' }
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'With inside label',
		id: 'switchInsideLabelStory',
		args: { size: 'md', onLabel: 'ON', offLabel: 'OFF' }
	});

	$.append($$anchor, fragment);
}