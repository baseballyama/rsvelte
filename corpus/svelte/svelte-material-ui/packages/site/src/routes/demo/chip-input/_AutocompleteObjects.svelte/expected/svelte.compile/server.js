import * as $ from 'svelte/internal/server';
import ChipInput from '@smui-extra/chip-input';

export default function _AutocompleteObjects($$renderer) {
	let colors = [
		{ id: 1, text: 'red' },
		{ id: 2, text: 'green' },
		{ id: 3, text: 'blue' }
	];

	let value = '';

	function handleChipInputEntry(event) {
		// This prevents the text itself from being pushed onto the array.
		event.preventDefault();

		// And we can push our own object containing the text.
		colors.push({
			id: colors.length ? Math.max(...colors.map((color) => color.id)) + 1 : 1,
			text: event.detail.text
		});

		value = '';
	}

	async function handleChipInputSelect(event) {
		// This prevents the text itself from being pushed onto the array.
		event.preventDefault();

		// And we can push our own object containing the text.
		colors.push({
			id: colors.length ? Math.max(...colors.map((color) => color.id)) + 1 : 1,
			text: event.detail
		});

		value = '';
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function chipTrailingAction($$renderer) {
				$$renderer.push(`<!---->cancel`);
			}

			function label($$renderer) {
				$$renderer.push(`<!---->Color Mix`);
			}

			ChipInput($$renderer, {
				key: (color) => color.id,
				getChipLabel: (color) => color.text,
				getChipText: (color) => color.text,
				chipTrailingAction$class: 'material-icons',
				'chipTrailingAction$aria-label': 'Remove color',
				autocomplete$combobox: true,
				autocomplete$options: colorList,
				onSMUIChipInputEntry: handleChipInputEntry,
				onSMUIChipInputSelect: handleChipInputSelect,
				get chips() {
					return colors;
				},

				set chips($$value) {
					colors = $$value;
					$$settled = false;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				chipTrailingAction,
				label,
				$$slots: { chipTrailingAction: true, label: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}