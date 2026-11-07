import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { useSvelteUITheme } from '$lib/styles';
import { Checkbox } from './index';

export default function Checkbox_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const theme = useSvelteUITheme();
		const colors = Object.keys(theme.colorNames);

		Meta($$renderer, { title: 'Components/Checkbox', component: Checkbox });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Checkbox($$renderer, $.spread_props([args]));
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Checkbox', id: 'checkboxStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Colors',
			id: 'checkboxColorsStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="display: flex; gap: 10px;"><!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];

					Checkbox($$renderer, { color });
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Disabled',
			id: 'checkboxDisabledStory',
			args: { disabled: true }
		});

		$$renderer.push(`<!---->`);
	});
}