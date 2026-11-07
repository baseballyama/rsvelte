import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story } from '@storybook/addon-svelte-csf';
import { Mark } from './index';
import Text from '../Text/Text.svelte';

var root = $.from_html(`Here's some random text with a <!> in it.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Mark_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Mark',
		get component() {
			return Mark;
		}
	});

	var node_1 = $.sibling(node, 2);

	Story(node_1, {
		name: 'Mark',
		id: 'markStory',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_2 = $.sibling($.first_child(fragment_2));

					Mark(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('highlight');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}