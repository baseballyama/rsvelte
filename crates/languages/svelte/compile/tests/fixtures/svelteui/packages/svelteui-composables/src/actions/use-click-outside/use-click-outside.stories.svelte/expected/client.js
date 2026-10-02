import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button, Paper } from '@svelteuidev/core';
import { clickoutside } from './index';

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Use_click_outside_stories($$anchor) {
	let open = true;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, { title: 'Composables/use-click-outside' });

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root();
				var node_2 = $.child(div);

				Button(node_2, {
					$$events: { click: () => open = true },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Open Modal');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent = ($$anchor) => {
						Paper($$anchor, {
							shadow: 'sm',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('This is a modal, click anywhere to close');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_3, ($$render) => {
						if (open) $$render(consequent);
					});
				}

				$.reset(div);
				$.action(div, ($$node, $$action_arg) => clickoutside?.($$node, $$action_arg), () => ({ enabled: open, callback: () => open = false }));
				$.append($$anchor, div);
			}
		}
	});

	var node_4 = $.sibling(node_1, 2);

	Story(node_4, { name: 'use-click-outside', id: 'useClickOutsideStory' });
	$.append($$anchor, fragment);
}