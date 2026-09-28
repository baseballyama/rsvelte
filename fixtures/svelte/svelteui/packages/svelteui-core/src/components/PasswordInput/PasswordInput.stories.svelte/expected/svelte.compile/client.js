import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { PasswordInput } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function PasswordInput_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/PasswordInput',
		get component() {
			return PasswordInput;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				PasswordInput($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Default',
		id: 'passwordInputStory',
		args: { label: 'Password', placeholder: 'A strong password' }
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Description',
		id: 'passwordInputDescriptionStory',
		args: {
			label: 'Password',
			description: "Make sure you don't tell anyone",
			placeholder: 'A strong password'
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Large',
		id: 'passwordInputLargeStory',
		args: { label: 'Password', size: 'lg' }
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Disabled',
		id: 'passwordInputDisabledStory',
		args: { label: 'Password', disabled: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Error',
		id: 'passwordInputErrorStory',
		args: {
			label: 'Password',
			placeholder: 'A strong password',
			error: "That's boring"
		}
	});

	$.append($$anchor, fragment);
}