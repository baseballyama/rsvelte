import * as $ from 'svelte/internal/server';
import { List } from '$lib';

export default function TestList($$renderer) {
	const options = { a: 1, b: 2, c: 3 };
	let selection = 1;
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		List($$renderer, {
			label: 'Alphanumerics 1',
			options,
			get value() {
				return selection;
			},

			set value($$value) {
				selection = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			label: 'Alphanumerics 2',
			options,
			get value() {
				return selection;
			},

			set value($$value) {
				selection = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(selection)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}