import * as $ from 'svelte/internal/server';
import { box } from 'svelte-toolbelt';
import { useNumberField } from './number-field.svelte.js';

export default function Number_field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = 0,
			step = 1,
			min,
			max,
			rampSettings = {
				startDelay: 400,
				rampUpTime: 0,
				minFrequency: 35,
				maxFrequency: 35
			},
			children
		} = $$props;

		useNumberField({
			value: box.with(() => value, (v) => value = v),
			step: box.with(() => step),
			min: box.with(() => min),
			max: box.with(() => max),
			rampSettings: box.with(() => rampSettings)
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value });
	});
}