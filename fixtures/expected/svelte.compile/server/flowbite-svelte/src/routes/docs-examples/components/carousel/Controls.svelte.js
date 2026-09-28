import * as $ from 'svelte/internal/server';
import { Carousel, Controls } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Controls_1($$renderer) {
	$$renderer.push(`<div class="max-w-4xl">`);

	Carousel($$renderer, {
		images,
		children: ($$renderer) => {
			Controls($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}