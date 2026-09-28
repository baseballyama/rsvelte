import * as $ from 'svelte/internal/server';
import { Checkbox, Text } from '$lib';

export default function TestText($$renderer) {
	let text = 'Cosmic Manifold';
	let live = true;
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Checkbox($$renderer, {
			label: 'Live',
			get value() {
				return live;
			},

			set value($$value) {
				live = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			label: 'The Message',
			live,
			get value() {
				return text;
			},

			set value($$value) {
				text = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			label: 'The Message',
			live,
			get value() {
				return text;
			},

			set value($$value) {
				text = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(text)}</span></pre> <pre>Live: <span>${$.escape(live)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}