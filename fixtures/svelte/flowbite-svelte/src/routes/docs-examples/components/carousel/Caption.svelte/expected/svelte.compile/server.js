import * as $ from 'svelte/internal/server';
import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Caption($$renderer) {
	let image = void 0;

	$$renderer.push(`<div class="max-w-4xl space-y-4">`);

	Carousel($$renderer, {
		images,
		onchange: (detail) => image = detail,
		children: ($$renderer) => {
			Controls($$renderer, {});
			$$renderer.push(`<!----> `);
			CarouselIndicators($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="my-2 h-10 rounded-sm bg-gray-300 p-2 text-center dark:bg-gray-700 dark:text-white">${$.escape(image?.alt)}</div></div>`);
}