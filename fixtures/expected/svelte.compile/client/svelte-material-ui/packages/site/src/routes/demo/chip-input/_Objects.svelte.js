import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChipInput from '@smui-extra/chip-input';

var root = $.from_html(`<div><!></div>`);

export default function _Objects($$anchor) {
	let items = $.state($.proxy([
		{ id: 1, text: 'Milk' },
		{ id: 2, text: 'Milk' },
		{ id: 3, text: 'Lemonade' }
	]));

	let value = $.state('');

	function handleChipInputEntry(event) {
		// This prevents the text itself from being pushed onto the array.
		event.preventDefault();

		// And we can push our own object containing the text.
		$.get(items).push({
			id: $.get(items).length
				? Math.max(...$.get(items).map((tag) => tag.id)) + 1
				: 1,
			text: event.detail.text
		});

		$.set(value, '');
	}

	var div = root();
	var node = $.child(div);

	{
		const chipTrailingAction = ($$anchor) => {
			$.next();

			var text = $.text('cancel');

			$.append($$anchor, text);
		};

		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Shopping List');

			$.append($$anchor, text_1);
		};

		ChipInput(node, {
			key: (item) => item.id,
			getChipLabel: (item) => item.text,
			getChipText: (item) => item.text,
			chipTrailingAction$class: 'material-icons',
			'chipTrailingAction$aria-label': 'Remove item',
			autocomplete$combobox: true,
			onSMUIChipInputEntry: handleChipInputEntry,
			get chips() {
				return $.get(items);
			},

			set chips($$value) {
				$.set(items, $$value, true);
			},

			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			chipTrailingAction,
			label,
			$$slots: { chipTrailingAction: true, label: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}