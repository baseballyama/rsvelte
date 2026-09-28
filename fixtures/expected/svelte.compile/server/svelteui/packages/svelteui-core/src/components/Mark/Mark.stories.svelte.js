import * as $ from 'svelte/internal/server';
import { Meta, Story } from '@storybook/addon-svelte-csf';
import { Mark } from './index';
import Text from '../Text/Text.svelte';

export default function Mark_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Mark', component: Mark });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Mark',
		id: 'markStory',
		children: ($$renderer) => {
			Text($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Here's some random text with a `);

					Mark($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->highlight`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> in it.`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}