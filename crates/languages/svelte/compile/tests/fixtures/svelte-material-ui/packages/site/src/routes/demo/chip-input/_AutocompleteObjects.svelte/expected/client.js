import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChipInput from '@smui-extra/chip-input';

var root = $.from_html(`<div><!></div>`);

export default function _AutocompleteObjects($$anchor) {
	let colors = $.state($.proxy([
		{ id: 1, text: 'red' },
		{ id: 2, text: 'green' },
		{ id: 3, text: 'blue' }
	]));

	let value = $.state('');

	function handleChipInputEntry(event) {
		// This prevents the text itself from being pushed onto the array.
		event.preventDefault();

		// And we can push our own object containing the text.
		$.get(colors).push({
			id: $.get(colors).length
				? Math.max(...$.get(colors).map((color) => color.id)) + 1
				: 1,
			text: event.detail.text
		});

		$.set(value, '');
	}

	async function handleChipInputSelect(event) {
		// This prevents the text itself from being pushed onto the array.
		event.preventDefault();

		// And we can push our own object containing the text.
		$.get(colors).push({
			id: $.get(colors).length
				? Math.max(...$.get(colors).map((color) => color.id)) + 1
				: 1,
			text: event.detail
		});

		$.set(value, '');
	}

	const colorList = [
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'purple',
		'pink',
		'cyan',
		'magenta'
	];

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

			var text_1 = $.text('Color Mix');

			$.append($$anchor, text_1);
		};

		ChipInput(node, {
			key: (color) => color.id,
			getChipLabel: (color) => color.text,
			getChipText: (color) => color.text,
			chipTrailingAction$class: 'material-icons',
			'chipTrailingAction$aria-label': 'Remove color',
			autocomplete$combobox: true,
			get autocomplete$options() {
				return colorList;
			},
			onSMUIChipInputEntry: handleChipInputEntry,
			onSMUIChipInputSelect: handleChipInputSelect,
			get chips() {
				return $.get(colors);
			},

			set chips($$value) {
				$.set(colors, $$value, true);
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