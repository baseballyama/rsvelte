import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { EnvelopeClosed } from 'radix-icons-svelte';
import { TextInput } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function TextInput_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/TextInput',
		get component() {
			return TextInput;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				TextInput($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Default',
		id: 'textInputStory',
		args: { label: 'Full name' }
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Description',
		id: 'textInputDescriptionStory',
		args: {
			label: 'Full name',
			description: 'Tell us your name',
			placeholder: 'Hanazono Yurine'
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Error',
		id: 'textInputErrorStory',
		args: {
			label: 'Full Name',
			placeholder: 'Hanazono Yurine',
			error: 'Something went wrong'
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => ({
			label: 'Email',
			placeholder: 'Your email',
			icon: EnvelopeClosed
		}));

		Story(node_5, {
			name: 'With icon',
			id: 'textInputIconStory',
			get args() {
				return $.get($0);
			}
		});
	}

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'With icon (slot)',
		id: 'textInputIconSlotStory',
		children: ($$anchor, $$slotProps) => {
			TextInput($$anchor, {
				label: 'Email',
				placeholder: 'Your email',
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