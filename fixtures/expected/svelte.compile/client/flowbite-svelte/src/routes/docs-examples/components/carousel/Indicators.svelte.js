import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel, CarouselIndicators } from "flowbite-svelte";
import images from "./imageData/images.json";

var root = $.from_html(`<div class="max-w-4xl"><!></div>`);

export default function Indicators($$anchor) {
	var div = root();
	var node = $.child(div);

	Carousel(node, {
		get images() {
			return images;
		},

		children: ($$anchor, $$slotProps) => {
			CarouselIndicators($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}