import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { AspectRatio } from './index';
import { Image } from '../Image';

var root = $.from_html(`<div style="background-color: purple;">AspectRatio</div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function AspectRatio_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/AspectRatio',
		get component() {
			return AspectRatio;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				AspectRatio($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Div',
		id: 'aspectRatioDivStory',
		children: ($$anchor, $$slotProps) => {
			AspectRatio($$anchor, {
				ratio: 16 / 9,
				children: ($$anchor, $$slotProps) => {
					var div = root();

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Image',
		id: 'aspectRatioImageStory',
		children: ($$anchor, $$slotProps) => {
			AspectRatio($$anchor, {
				ratio: 2,
				children: ($$anchor, $$slotProps) => {
					Image($$anchor, {
						height: '100%',
						src: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
						alt: 'Panda'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}