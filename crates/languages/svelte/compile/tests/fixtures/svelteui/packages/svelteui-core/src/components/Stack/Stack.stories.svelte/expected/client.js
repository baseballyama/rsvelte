import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button } from '../Button';
import { Stack } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Stack_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Stack',
		get component() {
			return Stack;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Stack($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Button(node_2, {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('1');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Button(node_3, {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('2');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Button(node_4, {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('3');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_5 = $.sibling(node_1, 2);

	Story(node_5, { name: 'Stack', id: 'stackStory' });
	$.append($$anchor, fragment);
}