import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Paper } from './index';

export default function Paper_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Paper', component: Paper });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: ($$renderer) => {
			Paper($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Paper is the most basic UI component. Use it to create cards, dropdowns, modals and other
		components that require background with shadow`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Paper', id: 'paperStory' });
	$$renderer.push(`<!---->`);
}