import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CarouselBasic from "./carousel-basic.svelte";
import CarouselMultiple from "./carousel-multiple.svelte";
import CarouselWithGap from "./carousel-with-gap.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Carousel($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'lg:grid-cols-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CarouselBasic(node, {});

			var node_1 = $.sibling(node, 2);

			CarouselMultiple(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			CarouselWithGap(node_2, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}