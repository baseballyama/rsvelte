import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chip, { ChipSet, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <div style="margin-top: 1em;">Programmatically add:</div> <!> <div style="margin-top: 1em;">Programmatically remove:</div> <!> <pre class="status"> </pre>`, 1);

export default function _Filter($$anchor) {
	let choices = ['Shoes', 'Pants', 'Shirts', 'Hats', 'Coats'];
	let selected = $.state($.proxy(['Shoes', 'Shirts', 'Coats']));

	function add(choice) {
		const idx = $.get(selected).findIndex((val) => val === choice);

		if (idx === -1) {
			$.get(selected).push(choice);
		}
	}

	function remove(choice) {
		const idx = $.get(selected).findIndex((val) => val === choice);

		if (idx !== -1) {
			$.get(selected).splice(idx, 1);
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
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, chip()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
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

	var node_1 = $.sibling(node, 4);

	$.each(node_1, 17, () => choices, $.index, ($$anchor, choice) => {
		Button($$anchor, {
			onclick: () => add($.get(choice)),
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(choice)));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 4);

	$.each(node_2, 17, () => choices, $.index, ($$anchor, choice) => {
		Button($$anchor, {
			onclick: () => remove($.get(choice)),
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(choice)));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var pre = $.sibling(node_2, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_3, `Selected: ${$0 ?? ''}`), [() => $.get(selected).join(', ')]);
	$.append($$anchor, fragment);
}