import * as $ from 'svelte/internal/server';
import ChipInput from '@smui-extra/chip-input';

export default function _Objects($$renderer) {
	let items = [
		{ id: 1, text: 'Milk' },
		{ id: 2, text: 'Milk' },
		{ id: 3, text: 'Lemonade' }
	];

	let value = '';

	function handleChipInputEntry(event) {
		// This prevents the text itself from being pushed onto the array.
		event.preventDefault();

		// And we can push our own object containing the text.
		items.push({
			id: items.length ? Math.max(...items.map((tag) => tag.id)) + 1 : 1,
			text: event.detail.text
		});

		value = '';
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function chipTrailingAction($$renderer) {
				$$renderer.push(`<!---->cancel`);
			}

			function label($$renderer) {
				$$renderer.push(`<!---->Shopping List`);
			}

			ChipInput($$renderer, {
				key: (item) => item.id,
				getChipLabel: (item) => item.text,
				getChipText: (item) => item.text,
				chipTrailingAction$class: 'material-icons',
				'chipTrailingAction$aria-label': 'Remove item',
				autocomplete$combobox: true,
				onSMUIChipInputEntry: handleChipInputEntry,
				get chips() {
					return items;
				},

				set chips($$value) {
					items = $$value;
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