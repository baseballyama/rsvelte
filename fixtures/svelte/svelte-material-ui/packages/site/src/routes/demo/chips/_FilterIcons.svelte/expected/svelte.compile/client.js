import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip, { ChipSet, LeadingIcon, Text } from '@smui/chips';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _FilterIcons($$anchor) {
	let choices = ['Shoes', 'Pants', 'Shirts', 'Hats', 'Coats'];
	let selected = $.state($.proxy(['Shoes', 'Shirts', 'Coats']));
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const chip = ($$anchor, chip = $.noop) => {
			Chip($$anchor, {
				get chip() {
					return chip();
				},
				touch: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					LeadingIcon(node_1, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('checkroom');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Text(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, chip()));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		ChipSet(node, {
			get chips() {
				return choices;
			},
			filter: true,
			get selected() {
				return $.get(selected);
			},

			set selected($$value) {
				$.set(selected, $$value, true);
			},
			chip,
			$$slots: { chip: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_2, `Selected: ${$0 ?? ''}`), [() => $.get(selected).join(', ')]);
	$.append($$anchor, fragment);
}