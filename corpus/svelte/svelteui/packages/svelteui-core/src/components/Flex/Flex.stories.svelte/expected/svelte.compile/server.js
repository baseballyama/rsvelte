import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Flex } from './index';
import { Button } from '../Button';

export default function Flex_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Flex', component: Flex });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Flex($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button 1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button 3`);
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
	Story($$renderer, { name: 'Flex', id: 'FlexStory', args: { gap: 'xl' } });
	$$renderer.push(`<!---->`);
}