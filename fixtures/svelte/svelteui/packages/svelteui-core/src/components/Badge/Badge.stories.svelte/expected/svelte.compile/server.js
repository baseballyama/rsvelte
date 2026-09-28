import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Group } from '../Group';
import { Badge } from './index';

export default function Badge_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Badge', component: Badge });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Badge($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hello`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Badge', id: 'badgeStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Gradient',
		parameters: { controls: { exclude: /.*/g } },
		id: 'badgeGradientStory',
		children: ($$renderer) => {
			Group($$renderer, {
				children: ($$renderer) => {
					Badge($$renderer, {
						variant: 'gradient',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hello`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Badge($$renderer, {
						variant: 'gradient',
						gradient: { from: 'green', to: 'yellow', deg: 90 },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hello`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}