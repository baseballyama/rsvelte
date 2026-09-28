import * as $ from 'svelte/internal/server';
import { AutoObject } from '$lib';

export default function TestAutoObject($$renderer) {
	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;

	let object = {
		// Creates a <Checkbox>
		someBoolean: true,

		// Creates a <Color> picker
		someColor: { r: 255, g: 0, b: 55 },
		// Wraps children in a <Folder>
		someFolder: { a: 1, b: 2, c: 3 },

		// Creates a <Slider>
		someNumber: 1,

		// Creates a <Point>
		somePoint: { x: 1, y: 2 },

		// Creates a <Text>
		someString: 'test'

		// TODO maybe
		// Creates a <Button>
		// someButton: () => {
		// 	alert('🎛️');
		// }
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		AutoObject($$renderer, {
			get object() {
				return object;
			},

			set object($$value) {
				object = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		AutoObject($$renderer, {
			get object() {
				return object;
			},

			set object($$value) {
				object = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <hr/> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre> <pre>Value: <span>${$.escape(JSON.stringify(object))}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}