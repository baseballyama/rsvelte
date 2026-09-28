import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Textarea } from './index';

export default function Textarea_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Textarea', component: Textarea });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Textarea($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Default',
		id: 'textareaStory',
		args: { label: 'Your story', placeholder: 'Once upon a time' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Description',
		id: 'textareaDescriptionStory',
		args: {
			label: 'Your story',
			description: 'Tell us about yourself',
			placeholder: 'Once upon a time'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Resizable',
		id: 'textareaResizableStory',
		args: {
			label: 'Your story',
			placeholder: 'Once upon a time',
			rows: 4,
			resize: 'vertical'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Error',
		id: 'textareaErrorStory',
		args: {
			label: 'Your story',
			placeholder: 'Once upon a time',
			error: "That's boring"
		}
	});

	$$renderer.push(`<!---->`);
}