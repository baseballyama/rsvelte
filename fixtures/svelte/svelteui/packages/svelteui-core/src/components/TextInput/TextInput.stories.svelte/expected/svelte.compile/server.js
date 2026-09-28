import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { EnvelopeClosed } from 'radix-icons-svelte';
import { TextInput } from './index';

export default function TextInput_stories($$renderer) {
	Meta($$renderer, { title: 'Components/TextInput', component: TextInput });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				TextInput($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Default',
		id: 'textInputStory',
		args: { label: 'Full name' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Description',
		id: 'textInputDescriptionStory',
		args: {
			label: 'Full name',
			description: 'Tell us your name',
			placeholder: 'Hanazono Yurine'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Error',
		id: 'textInputErrorStory',
		args: {
			label: 'Full Name',
			placeholder: 'Hanazono Yurine',
			error: 'Something went wrong'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With icon',
		id: 'textInputIconStory',
		args: {
			label: 'Email',
			placeholder: 'Your email',
			icon: EnvelopeClosed
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With icon (slot)',
		id: 'textInputIconSlotStory',
		children: ($$renderer) => {
			TextInput($$renderer, {
				label: 'Email',
				placeholder: 'Your email',
				$$slots: {
					icon: ($$renderer) => {
						{
							EnvelopeClosed($$renderer, {});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}