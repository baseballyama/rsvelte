import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button, Paper } from '@svelteuidev/core';
import { clickoutside } from './index';

export default function Use_click_outside_stories($$renderer) {
	let open = true;

	Meta($$renderer, { title: 'Composables/use-click-outside' });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div>`);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Modal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (open) {
					$$renderer.push('<!--[0-->');

					Paper($$renderer, {
						shadow: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a modal, click anywhere to close`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'use-click-outside', id: 'useClickOutsideStory' });
	$$renderer.push(`<!---->`);
}