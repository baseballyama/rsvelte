import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip, { ChipSet, TrailingAction, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _Keyed($$anchor, $$props) {
	$.push($$props, true);

	let myChips = $.state($.proxy([
		{ i: 1, label: 'Apple' },
		{ i: 2, label: 'Apple' },
		{ i: 3, label: 'Apple' },
		{ i: 4, label: 'Apple' }
	]));

	let selected = $.state(void 0);

	function addKeyedChip() {
		if ($.get(myChips).length) {
			$.get(myChips).push({
				i: $.get(myChips)[$.get(myChips).length - 1].i + 1,
				label: 'Apple'
			});
		} else {
			$.get(myChips).push({ i: 1, label: 'Apple' });
		}
	}

	var fragment = root_1();
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

							$.template_effect(() => $.set_text(text, chip().label));
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
			key: (chip) => `${chip.i}`,
			filter: true,
			input: true,
			get chips() {
				return $.get(myChips);
			},

			set chips($$value) {
				$.set(myChips, $$value, true);
			},

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

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		onclick: addKeyedChip,
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

	var pre = $.sibling(node_3, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_3, `Selected: ${$0 ?? ''}`), [
		() => $.get(selected) && $.get(selected).length
			? $.get(selected).map((chip) => JSON.stringify(chip)).join(', ')
			: 'None'
	]);

	$.append($$anchor, fragment);
	$.pop();
}