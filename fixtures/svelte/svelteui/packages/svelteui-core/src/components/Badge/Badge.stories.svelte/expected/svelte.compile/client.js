import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Group } from '../Group';
import { Badge } from './index';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Badge_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Badge',
		get component() {
			return Badge;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Badge($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Hello');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Badge', id: 'badgeStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Gradient',
		parameters: { controls: { exclude: /.*/g } },
		id: 'badgeGradientStory',
		children: ($$anchor, $$slotProps) => {
			Group($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					Badge(node_4, {
						variant: 'gradient',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Hello');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Badge(node_5, {
						variant: 'gradient',
						gradient: { from: 'green', to: 'yellow', deg: 90 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Hello');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}