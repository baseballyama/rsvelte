import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Title } from './index';

export default function Title_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Title', component: Title });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Title($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							$$renderer.push(`<!---->Title Storybook`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Title', id: 'titleStory' });
	$$renderer.push(`<!---->`);
}