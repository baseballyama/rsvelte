import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { PasswordInput } from './index';

export default function PasswordInput_stories($$renderer) {
	Meta($$renderer, { title: 'Components/PasswordInput', component: PasswordInput });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				PasswordInput($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Default',
		id: 'passwordInputStory',
		args: { label: 'Password', placeholder: 'A strong password' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Description',
		id: 'passwordInputDescriptionStory',
		args: {
			label: 'Password',
			description: "Make sure you don't tell anyone",
			placeholder: 'A strong password'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Large',
		id: 'passwordInputLargeStory',
		args: { label: 'Password', size: 'lg' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Disabled',
		id: 'passwordInputDisabledStory',
		args: { label: 'Password', disabled: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Error',
		id: 'passwordInputErrorStory',
		args: {
			label: 'Password',
			placeholder: 'A strong password',
			error: "That's boring"
		}
	});

	$$renderer.push(`<!---->`);
}