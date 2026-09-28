import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { AspectRatio } from './index';
import { Image } from '../Image';

export default function AspectRatio_stories($$renderer) {
	Meta($$renderer, { title: 'Components/AspectRatio', component: AspectRatio });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				AspectRatio($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Div',
		id: 'aspectRatioDivStory',
		children: ($$renderer) => {
			AspectRatio($$renderer, {
				ratio: 16 / 9,
				children: ($$renderer) => {
					$$renderer.push(`<div style="background-color: purple;">AspectRatio</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Image',
		id: 'aspectRatioImageStory',
		children: ($$renderer) => {
			AspectRatio($$renderer, {
				ratio: 2,
				children: ($$renderer) => {
					Image($$renderer, {
						height: '100%',
						src: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
						alt: 'Panda'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}