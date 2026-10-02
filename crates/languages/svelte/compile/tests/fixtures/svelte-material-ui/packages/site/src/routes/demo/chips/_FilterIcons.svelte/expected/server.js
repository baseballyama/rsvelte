import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, LeadingIcon, Text } from '@smui/chips';

export default function _FilterIcons($$renderer) {
	let choices = ['Shoes', 'Pants', 'Shirts', 'Hats', 'Coats'];
	let selected = ['Shoes', 'Shirts', 'Coats'];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function chip($$renderer, chip) {
				Chip($$renderer, {
					chip,
					touch: true,
					children: ($$renderer) => {
						LeadingIcon($$renderer, {
							class: 'material-icons',
							children: ($$renderer) => {
								$$renderer.push(`<!---->checkroom`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(chip)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			ChipSet($$renderer, {
				chips: choices,
				filter: true,
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
					$$settled = false;
				},
				chip,
				$$slots: { chip: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected.join(', '))}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}