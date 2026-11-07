import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button, Text, Title, NativeSelect, TextInput } from '@svelteuidev/core';
import { focustrap } from './use-focus-trap';

export default function Use_focus_trap_stories($$renderer) {
	let active = false;

	Meta($$renderer, { title: 'Composables/use-focus-trap' });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(active ? 'Deactivate Focus Trap' : 'Activate Focus Trap')}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div>`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Form`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Please fill out this form`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				TextInput($$renderer, { placeholder: 'Your name', label: 'Full name' });
				$$renderer.push(`<!----> `);

				NativeSelect($$renderer, {
					data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
					placeholder: 'Pick one',
					label: 'Select your favorite framework/library',
					description: 'This is anonymous'
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'use-focus-trap', id: 'useFocusTrapStory' });
	$$renderer.push(`<!---->`);
}