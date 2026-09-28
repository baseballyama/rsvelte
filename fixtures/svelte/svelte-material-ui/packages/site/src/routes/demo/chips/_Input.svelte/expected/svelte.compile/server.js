import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, TrailingAction, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

export default function _Input($$renderer) {
	let myChips = [1, 2, 3, 4];

	function addInputChip() {
		if (myChips.length) {
			myChips.push(myChips[myChips.length - 1] + 1);
		} else {
			myChips.push(1);
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
				input: true,
				get chips() {
					return myChips;
				},

				set chips($$value) {
					myChips = $$value;
					$$settled = false;
				},
				chip,
				$$slots: { chip: true }
			});
		}

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: addInputChip,
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

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}