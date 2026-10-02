import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Month } from './index';

export default function Month_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Meta($$renderer, { title: 'Dates/Month', component: Month });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Month($$renderer, $.spread_props([args, { month: new Date() }]));
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Month', id: 'monthStory' });
		$$renderer.push(`<!---->`);
	});
}