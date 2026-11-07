import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Box } from '../Box';
import { Divider } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Divider_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Divider',
		get component() {
			return Divider;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Divider(node_2, { label: 'Label on the left', labelPosition: 'left' });

			var node_3 = $.sibling(node_2, 2);

			Divider(node_3, { label: 'Label in the center', labelPosition: 'center' });

			var node_4 = $.sibling(node_3, 2);

			Divider(node_4, { label: 'Label on the right', labelPosition: 'right' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Story(node_5, { name: 'Divider', id: 'dividerStory' });

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Vertical',
		id: 'dividerVerticalStory',
		children: ($$anchor, $$slotProps) => {
			Box($$anchor, {
				css: { height: '200px', display: 'flex', justifyContent: 'center' },
				children: ($$anchor, $$slotProps) => {
					Divider($$anchor, { orientation: 'vertical' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}