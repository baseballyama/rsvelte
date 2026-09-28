import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Progress } from './index';

export default function Progress_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Progress', component: Progress });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Progress($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Menu', id: 'progressStory', args: { value: 40 } });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With label',
		id: 'progressLabelStory',
		args: { size: 'xl', value: 25, label: '25%' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sections',
		id: 'progressSectionsStory',
		children: ($$renderer) => {
			Progress($$renderer, {
				size: 'xl',
				sections: [
					{ value: 40, color: 'cyan' },
					{ value: 20, color: 'blue' },
					{ value: 15, color: 'indigo' }
				]
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}