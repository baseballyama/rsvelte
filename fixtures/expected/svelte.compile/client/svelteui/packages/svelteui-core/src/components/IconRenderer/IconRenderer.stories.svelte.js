import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { InfoCircled } from 'radix-icons-svelte';
import IconRenderer from './IconRenderer.svelte';

var root = $.from_html(`<span>Svelte component</span> <!> <br/> <span>SVG element</span> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function IconRenderer_stories($$anchor) {
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

	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/IconRenderer',
		get component() {
			return IconRenderer;
		},
		argTypes: { icon: { control: false }, iconSize: { control: 'number' } }
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var node_2 = $.sibling($.first_child(fragment_1), 2);

				IconRenderer(node_2, $.spread_props(() => $.get(args), {
					get icon() {
						return InfoCircled;
					}
				}));

				var node_3 = $.sibling(node_2, 6);

				IconRenderer(node_3, $.spread_props(() => $.get(args), {
					get icon() {
						return iconSvg;
					}
				}));

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_4 = $.sibling(node_1, 2);

	Story(node_4, {
		name: 'Default',
		args: { iconSize: 16 },
		id: 'iconRendererStory'
	});

	$.append($$anchor, fragment);
}