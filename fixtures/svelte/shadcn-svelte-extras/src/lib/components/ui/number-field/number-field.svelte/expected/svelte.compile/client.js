import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box } from 'svelte-toolbelt';
import { useNumberField } from './number-field.svelte.js';

export default function Number_field($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, 0),
		step = $.prop($$props, 'step', 3, 1),
		rampSettings = $.prop($$props, 'rampSettings', 19, () => ({
			startDelay: 400,
			rampUpTime: 0,
			minFrequency: 35,
			maxFrequency: 35
		}));

	useNumberField({
		value: box.with(() => value(), (v) => value(v)),
		step: box.with(() => step()),
		min: box.with(() => $$props.min),
		max: box.with(() => $$props.max),
		rampSettings: box.with(() => rampSettings())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}