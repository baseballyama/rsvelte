import * as $ from 'svelte/internal/server';
import { Button, Stack, Toggle } from "carbon-components-svelte";

export default function ToggleReactive($$renderer) {
	let toggled = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Toggle($$renderer, {
					labelText: 'Push notifications',
					get toggled() {
						return toggled;
					},

					set toggled($$value) {
						toggled = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div>`);

				Button($$renderer, {
					kind: 'tertiary',
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle
      ${$.escape(toggled ? "off" : "on")}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
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