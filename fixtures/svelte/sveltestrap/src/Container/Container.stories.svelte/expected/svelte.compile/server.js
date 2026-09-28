import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import Container from './Container.svelte';

export const meta = {
	title: 'Stories/Container',
	component: Container,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		sm: { control: 'boolean' },
		md: { control: 'boolean' },
		lg: { control: 'boolean' },
		xl: { control: 'boolean' },
		xxl: { control: 'boolean' },
		fluid: { control: 'boolean' },
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		sm: true,
		md: true,
		lg: true,
		xl: true,
		xxl: true,
		fluid: true
	}
};

export default function Container_stories($$renderer) {
	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Container($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							$$renderer.push(`<h3 class="container">fluid</h3>`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Basic',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid-example"><div class="container-wrapper">`);

			Container($$renderer, {
				fluid: true,
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="container">fluid</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="contained">`);

			Container($$renderer, {
				sm: true,
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="container">sm</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				md: true,
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="container">md</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				lg: true,
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="container">lg</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				xl: true,
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="container">xl</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				xxl: true,
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="container">xxl</h3>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}