import * as $ from 'svelte/internal/server';
import { File } from '$lib';

export default function TestFile($$renderer) {
	let file;
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		File($$renderer, {
			label: 'File 1',
			get value() {
				return file;
			},

			set value($$value) {
				file = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		File($$renderer, {
			label: 'File 2',
			get value() {
				return file;
			},

			set value($$value) {
				file = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(file)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}