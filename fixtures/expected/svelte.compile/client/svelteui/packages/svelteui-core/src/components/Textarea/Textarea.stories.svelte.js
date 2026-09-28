import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Textarea } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Textarea_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Textarea',
		get component() {
			return Textarea;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Textarea($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Default',
		id: 'textareaStory',
		args: { label: 'Your story', placeholder: 'Once upon a time' }
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Description',
		id: 'textareaDescriptionStory',
		args: {
			label: 'Your story',
			description: 'Tell us about yourself',
			placeholder: 'Once upon a time'
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Resizable',
		id: 'textareaResizableStory',
		args: {
			label: 'Your story',
			placeholder: 'Once upon a time',
			rows: 4,
			resize: 'vertical'
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Error',
		id: 'textareaErrorStory',
		args: {
			label: 'Your story',
			placeholder: 'Once upon a time',
			error: "That's boring"
		}
	});

	$.append($$anchor, fragment);
}