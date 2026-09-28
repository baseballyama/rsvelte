import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { NativeSelect } from './index';

export default function NativeSelect_stories($$renderer) {
	Meta($$renderer, { title: 'Components/NativeSelect', component: NativeSelect });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				NativeSelect($$renderer, $.spread_props([
					{
						data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
						placeholder: 'Pick one',
						label: 'Select your favorite framework/library',
						description: 'This is anonymous'
					},
					args
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'NativeSelect', id: 'nativeSelectStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'NativeSelect with error',
		id: 'nativeSelectErrorStory',
		args: { error: 'Pick at least one item' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'NativeSelect with array of objects',
		id: 'nativeSelectObjectsStory',
		args: {
			data: [
				{ value: 'svelte', label: 'Svelte' },
				{ value: 'react', label: 'React' },
				{ value: 'vue', label: 'Vue' },
				{ value: 'angular', label: 'Angular' },
				{ value: 'solid', label: 'Solid' }
			],
			placeholder: 'Pick one',
			label: 'Select your favorite framework/library',
			description: 'This is anonymous'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'NativeSelect with custom right section',
		id: 'nativeSelectRightSectionStory',
		children: ($$renderer) => {
			NativeSelect($$renderer, {
				data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
				placeholder: 'Pick one',
				label: 'Select your favorite framework/library',
				description: 'This is anonymous',
				$$slots: {
					rightSection: ($$renderer) => {
						{
							$$renderer.push(`+`);
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}