import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Text } from './index';

export default function Text_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Text', component: Text });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Text($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a nice text`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Text', id: 'textStory' });
	$$renderer.push(`<!---->`);
}