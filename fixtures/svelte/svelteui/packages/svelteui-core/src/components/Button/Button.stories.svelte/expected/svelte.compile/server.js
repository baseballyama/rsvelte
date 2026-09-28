import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { LockClosed } from 'radix-icons-svelte';
import { useSvelteUITheme } from '$lib/styles';
import { Group } from '../Group';
import { Button } from './index';

export default function Button_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const theme = useSvelteUITheme();
		const colors = Object.keys(theme.colorNames);

		Meta($$renderer, { title: 'Components/Button', component: Button });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Button($$renderer, $.spread_props([args]));
				}
			}
		});

		$$renderer.push(`<!----> `);

		Template($$renderer, {
			id: 'variants',
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Group($$renderer, {
						mt: 'xl',
						children: ($$renderer) => {
							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'filled',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Filled button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!----> `);

							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'light',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Light button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!----> `);

							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Outline button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!----> `);

							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'default',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Default button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!----> `);

							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'white',
									children: ($$renderer) => {
										$$renderer.push(`<!---->White button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!----> `);

							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'gradient',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Gradient button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!----> `);

							Button($$renderer, $.spread_props([
								args,
								{
									variant: 'subtle',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Subtle button`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Button', id: 'buttonStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Colors',
			id: 'buttonColorsStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="padding:40px;"><!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];

					Group($$renderer, {
						mt: 'xl',
						children: ($$renderer) => {
							Button($$renderer, {
								color,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Filled button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color,
								variant: 'light',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Light button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color,
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Outline button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color,
								variant: 'gradient',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Gradient button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'With icon',
			id: 'buttonIconStory',
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Sign Up`);
					},

					$$slots: {
						default: true,
						leftIcon: ($$renderer) => {
							LockClosed($$renderer, { slot: 'leftIcon' });
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Disabled',
			id: 'buttonDisabledStory',
			template: 'variants',
			args: { disabled: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Loading',
			id: 'buttonLoadingStory',
			template: 'variants',
			args: { loading: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'With href',
			id: 'buttonHrefStory',
			template: 'variants',
			args: {
				href: 'https://www.svelteui.dev',
				external: true,
				disabled: false,
				loading: false
			}
		});

		$$renderer.push(`<!---->`);
	});
}