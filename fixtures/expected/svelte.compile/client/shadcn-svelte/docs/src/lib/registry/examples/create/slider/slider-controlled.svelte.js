import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/registry/ui/label/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="grid w-full gap-3"><div class="flex items-center justify-between gap-2"><!> <span class="text-sm text-muted-foreground"> </span></div> <!></div>`);

export default function Slider_controlled($$anchor) {
	let value = $.state($.proxy([0.3, 0.7]));

	Example($$anchor, {
		title: 'Controlled',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Label(node, {
				for: 'slider-demo-temperature',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Temperature');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var span = $.sibling(node, 2);
			var text_1 = $.only_child(span, true);

			$.reset(div_1);

			var node_1 = $.sibling(div_1, 2);

			Slider(node_1, {
				id: 'slider-demo-temperature',
				type: 'multiple',
				min: 0,
				max: 1,
				step: 0.1,
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				}
			});

			$.reset(div);
			$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(value).join(", ")]);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}