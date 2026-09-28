import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Flex } from './index';
import { Button } from '../Button';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Flex_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Flex',
		get component() {
			return Flex;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Flex($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Button(node_2, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Button 1');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Button(node_3, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Button 2');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Button(node_4, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Button 3');

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

	Story(node_5, { name: 'Flex', id: 'FlexStory', args: { gap: 'xl' } });
	$.append($$anchor, fragment);
}