import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Switch } from './index';

export default function Switch_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Switch', component: Switch });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Switch($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Switch', id: 'switchStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Disabled',
		id: 'switchDisabledStory',
		children: ($$renderer) => {
			Switch($$renderer, { disabled: true });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With label',
		id: 'switchLabelStory',
		args: { label: 'I would like to receive annoying notifications ' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With inside label',
		id: 'switchInsideLabelStory',
		args: { size: 'md', onLabel: 'ON', offLabel: 'OFF' }
	});

	$$renderer.push(`<!---->`);
}