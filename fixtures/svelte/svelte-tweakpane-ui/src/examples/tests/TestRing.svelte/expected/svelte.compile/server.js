import * as $ from 'svelte/internal/server';
import { Ring } from '$lib';

export default function TestRing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const unitConfig = { value: 20, pixels: 40, ticks: 5 };
		let angle = 45;
		let binding1InternalEventCount = 0;
		let binding1ExternalEventCount = 0;
		let binding2InternalEventCount = 0;
		let binding2ExternalEventCount = 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Ring($$renderer, {
				format: (v) => `${(Math.abs(v) % 360).toFixed(0)}°`,
				label: 'Ring 1',
				pointerScale: -2.5,
				unit: unitConfig,
				wide: true,
				get value() {
					return angle;
				},

				set value($$value) {
					angle = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Ring($$renderer, {
				format: (v) => `${(Math.abs(v) % 360).toFixed(0)}°`,
				label: 'Ring 2',
				pointerScale: -2.5,
				unit: unitConfig,
				wide: true,
				get value() {
					return angle;
				},

				set value($$value) {
					angle = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <pre>Value: <span>${$.escape(angle)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}