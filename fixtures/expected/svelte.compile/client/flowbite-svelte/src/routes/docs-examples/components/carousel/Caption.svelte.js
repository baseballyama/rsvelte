import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
import images from "./imageData/images.json";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="max-w-4xl space-y-4"><!> <div class="my-2 h-10 rounded-sm bg-gray-300 p-2 text-center dark:bg-gray-700 dark:text-white"> </div></div>`);

export default function Caption($$anchor) {
	let image = $.state(void 0);
	var div = root_1();
	var node = $.child(div);

	Carousel(node, {
		get images() {
			return images;
		},
		onchange: (detail) => $.set(image, detail, true),
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Controls(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			CarouselIndicators(node_2, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var text = $.only_child(div_1, true);

	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(image)?.alt));
	$.append($$anchor, div);
}