import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, TrailingAction, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

export default function _Keyed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let myChips = [
			{ i: 1, label: 'Apple' },
			{ i: 2, label: 'Apple' },
			{ i: 3, label: 'Apple' },
			{ i: 4, label: 'Apple' }
		];

		let selected = void 0;

		function addKeyedChip() {
			if (myChips.length) {
				myChips.push({ i: myChips[myChips.length - 1].i + 1, label: 'Apple' });
			} else {
				myChips.push({ i: 1, label: 'Apple' });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function chip($$renderer, chip) {
					Chip($$renderer, {
						chip,
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(chip.label)}`);
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
					key: (chip) => `${chip.i}`,
					filter: true,
					input: true,
					get chips() {
						return myChips;
					},

					set chips($$value) {
						myChips = $$value;
						$$settled = false;
					},

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

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: addKeyedChip,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Add`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected && selected.length
				? selected.map((chip) => JSON.stringify(chip)).join(', ')
				: 'None')}</pre>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}