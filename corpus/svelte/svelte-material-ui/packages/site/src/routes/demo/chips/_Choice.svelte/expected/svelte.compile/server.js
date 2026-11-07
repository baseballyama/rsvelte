import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

export default function _Choice($$renderer) {
	let choices = ['Morning', 'Afternoon', 'Evening', 'Night'];
	let selected = 'Morning';
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
					},
					$$slots: { default: true }
				});
			}

			ChipSet($$renderer, {
				chips: choices,
				choice: true,
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

		$$renderer.push(`<!----> <div style="margin-top: 1em;">Programmatically select:</div> `);

		Button($$renderer, {
			onclick: () => selected = 'Morning',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Morning`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selected = 'Afternoon',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Afternoon`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selected = 'Evening',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Evening`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selected = 'Night',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Night`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}