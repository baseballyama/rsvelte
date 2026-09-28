import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button } from '../Button';
import { Stack } from './index';

export default function Stack_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Stack', component: Stack });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Stack($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Stack', id: 'stackStory' });
	$$renderer.push(`<!---->`);
}