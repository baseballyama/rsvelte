import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button, Text, Stack } from '@svelteuidev/core';
import { useDebounce } from './index';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Use_debounce_stories($$anchor, $$props) {
	$.push($$props, true);

	let updated = 0;
	let clicked = 0;

	const debouncedFn = useDebounce(
		() => {
			updated += 1;
		},
		1000
	);

	const clickedFn = () => {
		clicked += 1;
		debouncedFn();
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, { title: 'Composables/use-debounce' });

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Stack($$anchor, {
					align: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Button(node_2, {
							$$events: { click: clickedFn },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Smash me!');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Text(node_3, {
							root: 'note',
							size: 'sm',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Delay is set to 1000ms for this demo.');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Text(node_4, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, `Button clicked: ${clicked ?? ''}`));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						Text(node_5, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(() => $.set_text(text_3, `Event handler called: ${updated ?? ''}`));
								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_6 = $.sibling(node_1, 2);

	Story(node_6, { name: 'use-debounce', id: 'useDebounceStory' });
	$.append($$anchor, fragment);
	$.pop();
}