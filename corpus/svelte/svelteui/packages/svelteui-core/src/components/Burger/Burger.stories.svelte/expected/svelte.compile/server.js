import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Burger } from './index';
import { Button } from '../Button';

export default function Burger_stories($$renderer) {
	let opened = false;

	Meta($$renderer, { title: 'Components/Burger', component: Burger });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Burger($$renderer, $.spread_props([{ opened }, args]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Burger', id: 'burgerStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Burger inside a button',
		id: 'burgerButtonStory',
		children: ($$renderer) => {
			Button($$renderer, {
				ripple: true,
				variant: 'default',
				color: 'black',
				children: ($$renderer) => {
					Burger($$renderer, { opened, size: 'sm' });
					$$renderer.push(`<!----> Menu`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}