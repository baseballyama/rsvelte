import * as $ from 'svelte/internal/server';
import { Color } from '$lib';

export default function TestColor($$renderer) {
	let value = { r: 0, g: 0, b: 0 };
	let value2 = [0, 0, 0, 0];
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let binding3InternalEventCount = 0;
	let binding3ExternalEventCount = 0;
	let binding4InternalEventCount = 0;
	let binding4ExternalEventCount = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Color($$renderer, {
			label: 'Binding 1',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Color($$renderer, {
			label: 'Binding 2',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Color($$renderer, {
			label: 'Binding 3',
			get value() {
				return value2;
			},

			set value($$value) {
				value2 = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Color($$renderer, {
			label: 'Binding 4',
			get value() {
				return value2;
			},

			set value($$value) {
				value2 = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <hr/> <pre>Value Object: <span>${$.escape(JSON.stringify(value, undefined, 2))}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre> <pre>Value Tuple: <span>${$.escape(JSON.stringify(value2, undefined, 2))}</span></pre> <pre>Binding 3 Internal: <span>${$.escape(binding3InternalEventCount)}</span></pre> <pre>Binding 3 External: <span>${$.escape(binding3ExternalEventCount)}</span></pre> <pre>Binding 4 Internal: <span>${$.escape(binding4InternalEventCount)}</span></pre> <pre>Binding 5 External: <span>${$.escape(binding4ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}