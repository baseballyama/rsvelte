import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Alert } from './index';

export default function Alert_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Alert', component: Alert });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Alert($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is an alert!`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Alert', id: 'alertStory' });
	$$renderer.push(`<!---->`);
}