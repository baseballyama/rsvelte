import * as $ from 'svelte/internal/server';
import { Button, Checkbox, Stack } from "carbon-components-svelte";

export default function CheckboxReactive($$renderer) {
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			inline: true,
			gap: 4,
			children: ($$renderer) => {
				Checkbox($$renderer, {
					labelText: 'Label text',
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><strong>checked:</strong> ${$.escape(checked)}</div>`);
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