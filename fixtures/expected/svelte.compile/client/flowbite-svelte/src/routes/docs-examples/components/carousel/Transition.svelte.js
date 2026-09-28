import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
import images from "./imageData/images.json";
import { scale } from "svelte/transition";
import { quintOut } from "svelte/easing";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="max-w-4xl"><!></div>`);

export default function Transition($$anchor, $$props) {
	$.push($$props, true);

	const scaleAnimation = (node) => scale(node, { duration: 500, easing: quintOut });
	var div = root_1();
	var node_1 = $.child(div);

	Carousel(node_1, {
		get images() {
			return images;
		},
		transition: scaleAnimation,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Controls(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			CarouselIndicators(node_3, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}