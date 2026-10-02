import * as $ from 'svelte/internal/server';
import { Binding } from '$lib';

export default function TestBinding($$renderer) {
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let object = { v: 0 };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Binding($$renderer, {
			key: 'v',
			label: 'Binding 1',
			get object() {
				return object;
			},

			set object($$value) {
				object = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Binding($$renderer, {
			key: 'v',
			label: 'Binding 2',
			get object() {
				return object;
			},

			set object($$value) {
				object = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <hr/> <pre>Value: <span>${$.escape(object.v)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}