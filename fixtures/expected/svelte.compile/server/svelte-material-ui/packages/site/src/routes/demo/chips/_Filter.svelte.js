import * as $ from 'svelte/internal/server';
import Chip, { ChipSet, Text } from '@smui/chips';
import Button, { Label } from '@smui/button';

export default function _Filter($$renderer) {
	let choices = ['Shoes', 'Pants', 'Shirts', 'Hats', 'Coats'];
	let selected = ['Shoes', 'Shirts', 'Coats'];

	function add(choice) {
		const idx = selected.findIndex((val) => val === choice);

		if (idx === -1) {
			selected.push(choice);
		}
	}

	function remove(choice) {
		const idx = selected.findIndex((val) => val === choice);

		if (idx !== -1) {
			selected.splice(idx, 1);
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function chip($$renderer, chip) {
				Chip($$renderer, {
					chip,
					touch: true,
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

		$$renderer.push(`<!----> <div style="margin-top: 1em;">Programmatically add:</div> <!--[-->`);

		const each_array = $.ensure_array_like(choices);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let choice = each_array[$$index];

			Button($$renderer, {
				onclick: () => add(choice),
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(choice)}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--> <div style="margin-top: 1em;">Programmatically remove:</div> <!--[-->`);

		const each_array_1 = $.ensure_array_like(choices);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let choice = each_array_1[$$index_1];

			Button($$renderer, {
				onclick: () => remove(choice),
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(choice)}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--> <pre class="status">Selected: ${$.escape(selected.join(', '))}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}