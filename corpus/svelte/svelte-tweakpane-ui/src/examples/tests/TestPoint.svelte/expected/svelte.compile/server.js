import * as $ from 'svelte/internal/server';
import { Point } from '$lib';

export default function TestPoint($$renderer) {
	let point2d = { x: 0, y: 0 };
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;

	function listener(event) {
		console.log(event);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Point($$renderer, {
			expanded: true,
			label: '2D Point Picker 1',
			picker: 'inline',
			userExpandable: false,
			get value() {
				return point2d;
			},

			set value($$value) {
				point2d = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Point($$renderer, {
			expanded: true,
			label: '2D Point Picker 2',
			picker: 'inline',
			userExpandable: false,
			get value() {
				return point2d;
			},

			set value($$value) {
				point2d = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(JSON.stringify(point2d, null, 2))}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}