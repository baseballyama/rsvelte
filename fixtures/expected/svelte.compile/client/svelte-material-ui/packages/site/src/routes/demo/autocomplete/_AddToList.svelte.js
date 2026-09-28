import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';
import Chip, { ChipSet, TrailingAction, Text } from '@smui/chips';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><div class="status"><pre style="display: inline-block;">Selected:</pre> <!></div> <!></div>`);

export default function _AddToList($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let selected = $.state($.proxy([]));
	const available = $.derived(() => fruits.filter((value) => !$.get(selected).includes(value)));
	let selector;

	function handleSelection(event) {
		// Don't actually select the item.
		event.preventDefault();

		$.get(selected).push(event.detail);
	}

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	{
		const chip = ($$anchor, chip = $.noop) => {
			Chip($$anchor, {
				get chip() {
					return chip();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Text(node_1, {
						tabindex: 0,
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

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		ChipSet(node, {
			style: 'display: inline-block;',
			get chips() {
				return $.get(selected);
			},

			set chips($$value) {
				$.set(selected, $$value, true);
			},
			chip,
			$$slots: { chip: true }
		});
	}

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	$.bind_this(
		Autocomplete(node_3, {
			get options() {
				return $.get(available);
			},
			label: 'Fruit',
			showMenuWithNoInput: true,
			onSMUIAutocompleteSelected: handleSelection
		}),
		($$value) => selector = $$value,
		() => selector
	);

	$.reset(div);
	$.append($$anchor, div);
}