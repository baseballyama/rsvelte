import * as $ from 'svelte/internal/server';
import { NumberStepper } from 'svelte-ux';

export default function ColorRampControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { steps = undefined } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="inline-flex gap-3 items-center mb-4 screenshot-hidden"><span class="text-sm text-surface-content/50">Steps:</span> `);

			NumberStepper($$renderer, {
				dense: true,
				get value() {
					return steps;
				},

				set value($$value) {
					steps = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { steps });
	});
}