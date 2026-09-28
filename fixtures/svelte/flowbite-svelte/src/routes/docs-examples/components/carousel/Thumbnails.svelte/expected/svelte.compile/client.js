import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel, Controls, CarouselIndicators, Thumbnails } from "flowbite-svelte";
import images from "./imageData/images.json";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="max-w-4xl space-y-4"><!> <!></div>`);

export default function Thumbnails_1($$anchor) {
	let index = $.state(0);
	var div = root_1();
	var node = $.child(div);

	Carousel(node, {
		get images() {
			return images;
		},

		get index() {
			return $.get(index);
		},

		set index($$value) {
			$.set(index, $$value, true);
		},

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

	var node_3 = $.sibling(node, 2);

	Thumbnails(node_3, {
		get images() {
			return images;
		},

		get index() {
			return $.get(index);
		},

		set index($$value) {
			$.set(index, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}