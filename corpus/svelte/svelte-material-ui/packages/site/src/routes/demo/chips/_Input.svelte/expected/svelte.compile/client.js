import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip, { ChipSet, TrailingAction, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);

export default function _Input($$anchor) {
	let myChips = $.state($.proxy([1, 2, 3, 4]));

	function addInputChip() {
		if ($.get(myChips).length) {
			$.get(myChips).push($.get(myChips)[$.get(myChips).length - 1] + 1);
		} else {
			$.get(myChips).push(1);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		const chip = ($$anchor, chip = $.noop) => {
			Chip($$anchor, {
				get chip() {
					return chip();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Text(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, chip()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					TrailingAction(node_2, {
						icon$class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('cancel');

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
			input: true,
			get chips() {
				return $.get(myChips);
			},

			set chips($$value) {
				$.set(myChips, $$value, true);
			},
			chip,
			$$slots: { chip: true }
		});
	}

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		onclick: addInputChip,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Add');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}