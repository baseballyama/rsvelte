import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip, { ChipSet, LeadingIcon, TrailingIcon, Text } from '@smui/chips';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const chip = ($$anchor, chip = $.noop) => {
			Chip($$anchor, {
				get chip() {
					return chip();
				},
				shouldRemoveOnTrailingIconClick: false,
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							LeadingIcon($$anchor, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('book');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_1, ($$render) => {
							if (chip() === 'four') $$render(consequent);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					Text(node_2, {
						tabindex: 0,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, chip()));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							TrailingIcon($$anchor, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('commute');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_3, ($$render) => {
							if (chip() === 'five') $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		ChipSet(node, {
			chips: ['one', 'two', 'three', 'four', 'five'],
			chip,
			$$slots: { chip: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_3, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}