import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from "$lib/registry/ui/progress/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full flex-col gap-4"><!> <!></div>`);

export default function Progress_controlled($$anchor) {
	let value = $.state(50);

	Example($$anchor, {
		title: 'Controlled',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Progress(node, {
				get value() {
					return $.get(value);
				},
				class: 'w-full'
			});

			var node_1 = $.sibling(node, 2);

			Slider(node_1, {
				type: 'single',
				min: 0,
				max: 100,
				step: 1,
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}