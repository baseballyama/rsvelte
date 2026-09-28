import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Text } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Text_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Text',
		get component() {
			return Text;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Text($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('This is a nice text');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Text', id: 'textStory' });
	$.append($$anchor, fragment);
}