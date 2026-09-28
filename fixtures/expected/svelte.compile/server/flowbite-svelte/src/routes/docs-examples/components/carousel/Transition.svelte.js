import * as $ from 'svelte/internal/server';
import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
import images from "./imageData/images.json";
import { scale } from "svelte/transition";
import { quintOut } from "svelte/easing";

export default function Transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const scaleAnimation = (node) => scale(node, { duration: 500, easing: quintOut });

		$$renderer.push(`<div class="max-w-4xl">`);

		Carousel($$renderer, {
			images,
			transition: scaleAnimation,
			children: ($$renderer) => {
				Controls($$renderer, {});
				$$renderer.push(`<!----> `);
				CarouselIndicators($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}