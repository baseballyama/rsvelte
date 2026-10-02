import * as $ from 'svelte/internal/server';
import { Carousel, CarouselIndicators } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Indicators($$renderer) {
	$$renderer.push(`<div class="max-w-4xl">`);

	Carousel($$renderer, {
		images,
		children: ($$renderer) => {
			CarouselIndicators($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}