import * as $ from 'svelte/internal/server';
import { Button, Monitor, Slider } from '$lib';

export default function SvelteTweakpaneEventExample($$renderer) {
	let speed = 50;

	// Keep track of how many Slider change events originated from direct
	// interaction with the slider (internal) vs. programmatic changes set
	// when the button's clicked (external)
	let internalChangeCount = 0;

	let externalChangeCount = 0;

	// Change event handler
	// The SliderChangeEvent type is a convenient alias
	// to ValueChangeEvent<number>
	function onChange(event) {
		// Identify where the event came from, 'internal' or 'external'
		event.detail.origin === 'internal' ? internalChangeCount++ : externalChangeCount++;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			label: 'Set Speed Limit:',
			max: 100,
			min: 0,
			get value() {
				return speed;
			},

			set value($$value) {
				speed = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Monitor($$renderer, {
			format: (v) => v.toFixed(0),
			label: 'Internal change events:',
			value: internalChangeCount
		});

		$$renderer.push(`<!----> `);

		Monitor($$renderer, {
			format: (v) => v.toFixed(0),
			label: 'External change events:',
			value: externalChangeCount
		});

		$$renderer.push(`<!----> `);
		Button($$renderer, { label: 'Change limit externally:', title: 'Limit: 55' });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}