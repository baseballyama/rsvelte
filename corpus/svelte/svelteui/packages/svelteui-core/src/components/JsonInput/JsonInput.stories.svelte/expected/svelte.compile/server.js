import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { JsonInput } from './index';

export default function JsonInput_stories($$renderer) {
	const sampleJson = '{"name": "Hanazono Yurine", "friends": [{"name": "Jashinchan"}, {"name": "Medusa"}, {"name": "Minos"}]}';

	Meta($$renderer, { title: 'Components/JsonInput', component: JsonInput });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				JsonInput($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Default',
		id: 'jsonInputStory',
		args: {
			label: 'Character Profile',
			placeholder: 'Enter JSON data',
			value: sampleJson,
			required: true
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Format On Blur',
		id: 'jsonInputFormatOnBlurStory',
		args: {
			label: 'Character Profile',
			placeholder: 'Enter JSON data',
			value: sampleJson,
			formatOnBlur: true
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
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

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Error',
		id: 'jsonInputErrorStory',
		args: {
			label: 'Robot configuration',
			placeholder: 'Enter JSON data',
			error: 'Generic error message'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Validation',
		id: 'jsonInputValidationStory',
		args: {
			label: 'Robot configuration',
			placeholder: 'Enter JSON data',
			validationError: 'Invalid JSON'
		}
	});

	$$renderer.push(`<!---->`);
}