import * as $ from 'svelte/internal/server';
import { Button, RadioButton, RadioButtonGroup, Stack } from "carbon-components-svelte";

export default function RadioButtonReactive($$renderer) {
	const plans = ["Free (1 GB)", "Standard (10 GB)", "Pro (128 GB)"];
	let plan = plans[1];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				RadioButtonGroup($$renderer, {
					legendText: 'Storage tier (disk)',
					name: 'plan',
					get selected() {
						return plan;
					},

					set selected($$value) {
						plan = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(plans);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let value = each_array[$$index];

							RadioButton($$renderer, { labelText: value, value });
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div><!--[-->`);

						const each_array_1 = $.ensure_array_like(plans);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let value = each_array_1[$$index_1];

							Button($$renderer, {
								size: 'small',
								kind: 'secondary',
								disabled: plan === value,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select "${$.escape(value)}"`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div>Selected plan: <strong>${$.escape(plan)}</strong></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}