import * as $ from 'svelte/internal/server';
import { Carousel, Controls, CarouselIndicators, Thumbnails } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Thumbnails_1($$renderer) {
	let index = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="max-w-4xl space-y-4">`);

		Carousel($$renderer, {
			images,
			get index() {
				return index;
			},

			set index($$value) {
				index = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Controls($$renderer, {});
				$$renderer.push(`<!----> `);
				CarouselIndicators($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Thumbnails($$renderer, {
			images,
			get index() {
				return index;
			},

			set index($$value) {
				index = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}