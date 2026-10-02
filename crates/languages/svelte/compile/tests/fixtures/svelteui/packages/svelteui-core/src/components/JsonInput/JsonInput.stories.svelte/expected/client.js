import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { JsonInput } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function JsonInput_stories($$anchor) {
	const sampleJson = '{"name": "Hanazono Yurine", "friends": [{"name": "Jashinchan"}, {"name": "Medusa"}, {"name": "Minos"}]}';
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/JsonInput',
		get component() {
			return JsonInput;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				JsonInput($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Default',
		id: 'jsonInputStory',
		args: {
			label: 'Character Profile',
			placeholder: 'Enter JSON data',
			value: sampleJson,
			required: true
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Format On Blur',
		id: 'jsonInputFormatOnBlurStory',
		args: {
			label: 'Character Profile',
			placeholder: 'Enter JSON data',
			value: sampleJson,
			formatOnBlur: true
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Resizable',
		id: 'jsonInputResizableStory',
		args: {
			label: 'Robot configuration',
			description: 'Configure your new robot butler',
			placeholder: 'Enter JSON data',
			rows: 4,
			resize: 'vertical'
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Error',
		id: 'jsonInputErrorStory',
		args: {
			label: 'Robot configuration',
			placeholder: 'Enter JSON data',
			error: 'Generic error message'
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Validation',
		id: 'jsonInputValidationStory',
		args: {
			label: 'Robot configuration',
			placeholder: 'Enter JSON data',
			validationError: 'Invalid JSON'
		}
	});

	$.append($$anchor, fragment);
}