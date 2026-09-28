import * as $ from 'svelte/internal/server';
import ChipInput from '@smui-extra/chip-input';

export default function _AddChipKeys($$renderer) {
	let tags = ['great', 'awesome', 'wonderful'];
	let value = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function chipTrailingAction($$renderer) {
				$$renderer.push(`<!---->cancel`);
			}

			function label($$renderer) {
				$$renderer.push(`<!---->Tags`);
			}

			ChipInput($$renderer, {
				autocomplete$combobox: true,
				chipTrailingAction$class: 'material-icons',
				'chipTrailingAction$aria-label': 'Remove tag',
				addChipKeys: [' ', ',', '-', '+'],
				get chips() {
					return tags;
				},

				set chips($$value) {
					tags = $$value;
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