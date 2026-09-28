import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Blockquote } from './index';
import { Center } from '../Center/index';
import { EnvelopeClosed } from 'radix-icons-svelte';

var root = $.from_html(`<div style="max-width: 600px;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Blockquote_stories($$anchor) {
	const text = `Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.`;

	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Blockquote',
		get component() {
			return Blockquote;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Center($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var div = root();
						var node_2 = $.child(div);

						Blockquote(node_2, $.spread_props(() => $.get(args), {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								text_1.nodeValue = 'Money is just one thing, folks. There\'s a lot of other one things that are everything. There\'s\n		also that one thing that\'s a one thing so special you\'d give every other one thing to save that\n		one thing and be lost without that one thing. And if you lost that one thing, you\'d be left with\n		nothing. A nothing so empty and cold that all the other one things will mean nothing.';
								$.append($$anchor, text_1);
							},

							$$slots: {
								default: true,
								cite: ($$anchor, $$slotProps) => {
									var text_2 = $.text('- Corey Riffin');

									$.append($$anchor, text_2);
								}
							}
						}));

						$.reset(div);
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_3 = $.sibling(node_1, 2);

	Story(node_3, {
		name: 'Default',
		id: 'blockquoteStory',
		args: { iconSize: 20 }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'No Icon',
		id: 'blockquoteNoIconStory',
		args: { icon: null }
	});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => ({ icon: EnvelopeClosed }));

		Story(node_5, {
			name: 'Custom Icon',
			id: 'blockquoteCustomIconStory',
			get args() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
}