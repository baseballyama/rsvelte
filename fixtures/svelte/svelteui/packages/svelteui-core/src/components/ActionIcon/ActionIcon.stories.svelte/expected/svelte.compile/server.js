import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { useSvelteUITheme } from '$lib/styles';
import { Group } from '../Group';
import { ActionIcon } from './index';

export default function ActionIcon_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const theme = useSvelteUITheme();
		const colors = Object.keys(theme.colorNames);

		Meta($$renderer, { title: 'Components/ActionIcon', component: ActionIcon });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					ActionIcon($$renderer, $.spread_props([args]));
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
							ActionIcon($$renderer, $.spread_props([args, { variant: 'hover' }]));
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, $.spread_props([args, { variant: 'filled' }]));
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, $.spread_props([args, { variant: 'outline' }]));
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, $.spread_props([args, { variant: 'light' }]));
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, $.spread_props([args, { variant: 'default' }]));
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, $.spread_props([args, { variant: 'transparent' }]));
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'ActionIcon', id: 'actionIconStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Colors',
			id: 'actionIconColorsStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="padding:40px;"><!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];

					Group($$renderer, {
						mt: 'xl',
						children: ($$renderer) => {
							ActionIcon($$renderer, { color });
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, { color, variant: 'filled' });
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, { color, variant: 'outline' });
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, { color, variant: 'light' });
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, { color, variant: 'default' });
							$$renderer.push(`<!----> `);
							ActionIcon($$renderer, { color, variant: 'transparent' });
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
			name: 'Disabled',
			id: 'actionDisabledStory',
			template: 'variants',
			args: { disabled: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Loading',
			id: 'actionLoadingStory',
			template: 'variants',
			args: { loading: true }
		});

		$$renderer.push(`<!---->`);
	});
}