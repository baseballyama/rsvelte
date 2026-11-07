import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Paper } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Paper_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Paper',
		get component() {
			return Paper;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: ($$anchor, $$slotProps) => {
			Paper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Paper is the most basic UI component. Use it to create cards, dropdowns, modals and other\n		components that require background with shadow');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Paper', id: 'paperStory' });
	$.append($$anchor, fragment);
}