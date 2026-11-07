import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SliderBasic from "./slider-basic.svelte";
import SliderControlled from "./slider-controlled.svelte";
import SliderDisabled from "./slider-disabled.svelte";
import SliderMultiple from "./slider-multiple.svelte";
import SliderRange from "./slider-range.svelte";
import SliderVertical from "./slider-vertical.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Slider($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SliderBasic(node, {});

			var node_1 = $.sibling(node, 2);

			SliderRange(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SliderMultiple(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			SliderVertical(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			SliderControlled(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			SliderDisabled(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}