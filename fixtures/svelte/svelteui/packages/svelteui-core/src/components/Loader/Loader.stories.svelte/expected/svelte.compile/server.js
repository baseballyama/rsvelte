import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Loader } from './index';

export default function Loader_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Loader', component: Loader });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Loader($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Default', id: 'loaderStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Variants',
		id: 'loaderVariantsStory',
		children: ($$renderer) => {
			Loader($$renderer, { variant: 'circle' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { variant: 'dots' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { variant: 'bars' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Colors',
		id: 'loaderColorsStory',
		children: ($$renderer) => {
			Loader($$renderer, { color: 'red' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'green' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'teal' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'gray' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'blue' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'yellow' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Size',
		id: 'loaderSizeStory',
		children: ($$renderer) => {
			Loader($$renderer, { size: 'xs' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { size: 'lg' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { size: 50 });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { size: 200 });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}