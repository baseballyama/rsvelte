import * as $ from 'svelte/internal/server';
import { mdiBomb } from '@mdi/js';
import ChipInput from '@smui-extra/chip-input';

export default function _SvgRemoveIcons($$renderer) {
	let tags = ['great', 'awesome', 'wonderful'];
	let value = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function chipTrailingAction($$renderer) {
				$$renderer.push(`<svg style="display: block;" viewBox="0 0 24 24"><path fill="currentColor"${$.attr('d', mdiBomb)}></path></svg>`);
			}

			function label($$renderer) {
				$$renderer.push(`<!---->Tags`);
			}

			ChipInput($$renderer, {
				autocomplete$combobox: true,
				'chipTrailingAction$aria-label': 'Remove tag',
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