import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import * as easings from 'svelte/easing';
import { MenuField } from 'svelte-ux';

var root = $.from_html(`<div class="screenshot-hidden"><!></div>`);

export default function PathDataMenuField($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		amplitude = $.prop($$props, 'amplitude', 3, 1),
		frequency = $.prop($$props, 'frequency', 3, 10),
		phase = $.prop($$props, 'phase', 3, 0);

	const mathOptions = $.derived(() => [
		{
			label: 'sin',
			group: 'math',
			value: (x) => amplitude() * Math.sin(x * frequency()) + phase()
		},

		{
			label: 'cos',
			group: 'math',
			value: (x) => amplitude() * Math.cos(x * frequency()) + phase()
		},

		{
			label: 'tan',
			group: 'math',
			value: (x) => amplitude() * Math.tan(x * frequency()) + phase()
		},

		{
			label: 'sqrt',
			group: 'math',
			value: (x) => amplitude() * Math.sqrt(x * frequency()) + phase()
		},

		{
			label: 'ceil',
			group: 'math',
			value: (x) => amplitude() * Math.ceil(x * frequency()) + phase()
		},

		{
			label: 'floor',
			group: 'math',
			value: (x) => amplitude() * Math.floor(x * frequency()) + phase()
		},

		{
			label: 'round',
			group: 'math',
			value: (x) => amplitude() * Math.round(x * frequency()) + phase()
		},

		{
			label: 'random',
			group: 'math',
			value: (x) => amplitude() * Math.random() + phase()
		},

		{
			label: 'pow',
			group: 'math',
			value: (x) => amplitude() * Math.pow(x, frequency()) + phase()
		}
	]);

	const easingOptions = Object.entries(easings).map(([key, value]) => {
		return { label: key, value, group: 'easing' };
	});

	const options = $.derived(() => [...$.get(mathOptions), ...easingOptions]);

	// Select initial option
	onMount(() => {
		value($.get(options)[0].value);
	});

	var div = root();
	var node = $.child(div);

	MenuField(node, {
		label: 'Path data',
		get options() {
			return $.get(options);
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return value();
		},

		set value($$value) {
			value($$value);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}