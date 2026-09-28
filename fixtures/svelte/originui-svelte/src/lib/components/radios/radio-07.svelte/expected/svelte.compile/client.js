import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Choose a color</legend> <!></fieldset>`);

export default function Radio_07($$anchor) {
	let selectedColor = $.state('blue');
	var fieldset = root_1();
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'flex gap-1.5',
		get value() {
			return $.get(selectedColor);
		},

		set value($$value) {
			$.set(selectedColor, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			RadioGroupItem(node_1, {
				value: 'blue',
				id: 'radio-07-blue',
				'aria-label': 'Blue',
				class: 'size-6 border-blue-500 bg-blue-500 shadow-none data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500'
			});

			var node_2 = $.sibling(node_1, 2);

			RadioGroupItem(node_2, {
				value: 'indigo',
				id: 'radio-07-indigo',
				'aria-label': 'Indigo',
				class: 'size-6 border-indigo-500 bg-indigo-500 shadow-none data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500'
			});

			var node_3 = $.sibling(node_2, 2);

			RadioGroupItem(node_3, {
				value: 'pink',
				id: 'radio-07-pink',
				'aria-label': 'Pink',
				class: 'size-6 border-pink-500 bg-pink-500 shadow-none data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-500'
			});

			var node_4 = $.sibling(node_3, 2);

			RadioGroupItem(node_4, {
				value: 'red',
				id: 'radio-07-red',
				'aria-label': 'Red',
				class: 'size-6 border-red-500 bg-red-500 shadow-none data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500'
			});

			var node_5 = $.sibling(node_4, 2);

			RadioGroupItem(node_5, {
				value: 'orange',
				id: 'radio-07-orange',
				'aria-label': 'Orange',
				class: 'size-6 border-orange-500 bg-orange-500 shadow-none data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500'
			});

			var node_6 = $.sibling(node_5, 2);

			RadioGroupItem(node_6, {
				value: 'yellow',
				id: 'radio-07-yellow',
				'aria-label': 'Yellow',
				class: 'size-6 border-yellow-500 bg-yellow-500 shadow-none data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-500'
			});

			var node_7 = $.sibling(node_6, 2);

			RadioGroupItem(node_7, {
				value: 'green',
				id: 'radio-07-green',
				'aria-label': 'Green',
				class: 'size-6 border-green-500 bg-green-500 shadow-none data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500'
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.append($$anchor, fieldset);
}