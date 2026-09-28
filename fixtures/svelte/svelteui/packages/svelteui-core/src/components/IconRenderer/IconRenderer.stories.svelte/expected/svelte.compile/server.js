import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { InfoCircled } from 'radix-icons-svelte';
import IconRenderer from './IconRenderer.svelte';

export default function IconRenderer_stories($$renderer) {
	const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	iconSvg.setAttribute('fill', 'none');
	iconSvg.setAttribute('viewBox', '0 0 24 24');
	iconSvg.setAttribute('stroke', 'currentColor');
	iconSvg.classList.add('post-icon');
	iconPath.setAttribute('d', 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1');
	iconPath.setAttribute('stroke-linecap', 'round');
	iconPath.setAttribute('stroke-linejoin', 'round');
	iconPath.setAttribute('stroke-width', '2');
	iconSvg.appendChild(iconPath);

	Meta($$renderer, {
		title: 'Components/IconRenderer',
		component: IconRenderer,
		argTypes: { icon: { control: false }, iconSize: { control: 'number' } }
	});

	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<span>Svelte component</span> `);
				IconRenderer($$renderer, $.spread_props([args, { icon: InfoCircled }]));
				$$renderer.push(`<!----> <br/> <span>SVG element</span> `);
				IconRenderer($$renderer, $.spread_props([args, { icon: iconSvg }]));
				$$renderer.push(`<!---->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Default',
		args: { iconSize: 16 },
		id: 'iconRendererStory'
	});

	$$renderer.push(`<!---->`);
}