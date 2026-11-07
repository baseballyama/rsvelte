import * as $ from 'svelte/internal/server';
import { Story } from '@storybook/addon-svelte-csf';
import { BreadcrumbItem } from '@sveltestrap/sveltestrap';
import Breadcrumb from './Breadcrumb.svelte';

export const meta = {
	title: 'Stories/Breadcrumbs',
	component: Breadcrumb,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		content: { control: '' },
		divider: { control: '' },
		listClassName: { control: '' },
		style: { control: '' },
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
		class: '',
		content: '',
		divider: '/',
		listClassName: '',
		style: ''
	}
};

export default function Breadcrumb_stories($$renderer) {
	Story($$renderer, {
		name: 'Basic',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="breadcrumbs-example">`);

				Breadcrumb($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							BreadcrumbItem($$renderer, {
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Home`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----> `);

				Breadcrumb($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							BreadcrumbItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="#home">Home</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							BreadcrumbItem($$renderer, {
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Library`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----> `);

				Breadcrumb($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							BreadcrumbItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="#home">Home</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							BreadcrumbItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="#library">Library</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							BreadcrumbItem($$renderer, {
								active: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Data`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Divider',
		children: ($$renderer) => {
			$$renderer.push(`<div class="breadcrumbs-example">`);

			Breadcrumb($$renderer, {
				divider: '・',
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Home</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#library">Library</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Data`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Breadcrumb($$renderer, {
				divider: '⟫',
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Home</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#library">Library</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Data`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}