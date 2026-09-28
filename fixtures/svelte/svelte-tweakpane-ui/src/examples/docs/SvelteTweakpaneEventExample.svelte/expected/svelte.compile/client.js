import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Monitor, Slider } from '$lib';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function SvelteTweakpaneEventExample($$anchor) {
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

	var fragment = root();
	var node = $.first_child(fragment);

	// A Svelte reactive statement is (usually) a much better way to respond
	// to value changes! $: console.log(speed);
	Slider(node, {
		label: 'Set Speed Limit:',
		max: 100,
		min: 0,
		get value() {
			return speed;
		},

		set value($$value) {
			speed = $$value;
		},
		$$events: { change: onChange }
	});

	var node_1 = $.sibling(node, 2);

	Monitor(node_1, {
		format: (v) => v.toFixed(0),
		label: 'Internal change events:',
		get value() {
			return internalChangeCount;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Monitor(node_2, {
		format: (v) => v.toFixed(0),
		label: 'External change events:',
		get value() {
			return externalChangeCount;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		label: 'Change limit externally:',
		title: 'Limit: 55',
		$$events: {
			click: () => {
				speed = 55;
			}
		}
	});

	$.append($$anchor, fragment);
}