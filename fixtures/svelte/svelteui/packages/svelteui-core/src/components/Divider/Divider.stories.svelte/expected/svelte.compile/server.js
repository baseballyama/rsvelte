import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Box } from '../Box';
import { Divider } from './index';

export default function Divider_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Divider', component: Divider });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: ($$renderer) => {
			Divider($$renderer, { label: 'Label on the left', labelPosition: 'left' });
			$$renderer.push(`<!----> `);
			Divider($$renderer, { label: 'Label in the center', labelPosition: 'center' });
			$$renderer.push(`<!----> `);
			Divider($$renderer, { label: 'Label on the right', labelPosition: 'right' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Divider', id: 'dividerStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Vertical',
		id: 'dividerVerticalStory',
		children: ($$renderer) => {
			Box($$renderer, {
				css: { height: '200px', display: 'flex', justifyContent: 'center' },
				children: ($$renderer) => {
					Divider($$renderer, { orientation: 'vertical' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}