import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex items-center gap-6"><!> <!></div>`);

export default function Slider_vertical($$anchor) {
	Example($$anchor, {
		title: 'Vertical',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Slider(node, {
				type: 'single',
				value: 50,
				max: 100,
				step: 1,
				orientation: 'vertical',
				class: 'h-40'
			});

			var node_1 = $.sibling(node, 2);

			Slider(node_1, {
				type: 'single',
				value: 25,
				max: 100,
				step: 1,
				orientation: 'vertical',
				class: 'h-40'
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}