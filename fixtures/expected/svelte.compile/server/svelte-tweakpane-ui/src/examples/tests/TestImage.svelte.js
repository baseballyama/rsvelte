import * as $ from 'svelte/internal/server';
import { Button, Image } from '$lib';

export default function TestImage($$renderer) {
	let source = 'placeholder';

	async function getRandomKittenUrl() {
		const { url } = await fetch('https://loremflickr.com/800/800/kitten', { method: 'HEAD' });

		return url;
	}

	let binding1InternalEventCount = 0;
	let binding1ExternalEventCount = 0;
	let binding2InternalEventCount = 0;
	let binding2ExternalEventCount = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, { label: 'Random Placeholder', title: 'Load Cat' });
		$$renderer.push(`<!----> `);

		Image($$renderer, {
			fit: 'contain',
			label: 'Image 1',
			get value() {
				return source;
			},

			set value($$value) {
				source = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Image($$renderer, {
			fit: 'contain',
			label: 'Image 2',
			get value() {
				return source;
			},

			set value($$value) {
				source = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(source)}</span></pre> <pre>Binding 1 Internal: <span>${$.escape(binding1InternalEventCount)}</span></pre> <pre>Binding 1 External: <span>${$.escape(binding1ExternalEventCount)}</span></pre> <pre>Binding 2 Internal: <span>${$.escape(binding2InternalEventCount)}</span></pre> <pre>Binding 2 External: <span>${$.escape(binding2ExternalEventCount)}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}