import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';
import Chip, { ChipSet, TrailingAction, Text } from '@smui/chips';

export default function _AddToList($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let selected = [];
	const available = $.derived(() => fruits.filter((value) => !selected.includes(value)));
	let selector;

	function handleSelection(event) {
		// Don't actually select the item.
		event.preventDefault();

		selected.push(event.detail);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div><div class="status"><pre style="display: inline-block;">Selected:</pre> `);

		{
			function chip($$renderer, chip) {
				Chip($$renderer, {
					chip,
					children: ($$renderer) => {
						Text($$renderer, {
							tabindex: 0,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(chip)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TrailingAction($$renderer, {
							icon$class: 'material-icons',
							children: ($$renderer) => {
								$$renderer.push(`<!---->cancel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			ChipSet($$renderer, {
				style: 'display: inline-block;',
				get chips() {
					return selected;
				},

				set chips($$value) {
					selected = $$value;
					$$settled = false;
				},
				chip,
				$$slots: { chip: true }
			});
		}

		$$renderer.push(`<!----></div> `);

		Autocomplete($$renderer, {
			options: available(),
			label: 'Fruit',
			showMenuWithNoInput: true,
			onSMUIAutocompleteSelected: handleSelection
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}