import * as $ from 'svelte/internal/server';
import { RotationQuaternion } from '$lib';

export default function TestRotationQuaternion($$renderer) {
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let value = [0, 0, 0, 0];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RotationQuaternion($$renderer, {
			expanded: true,
			label: 'CSS Rotation 1',
			picker: 'inline',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		RotationQuaternion($$renderer, {
			expanded: true,
			label: 'CSS Rotation 2',
			picker: 'inline',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(value)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}