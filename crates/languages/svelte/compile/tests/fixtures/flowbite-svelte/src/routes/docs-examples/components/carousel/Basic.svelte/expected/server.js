import * as $ from 'svelte/internal/server';
import { Carousel } from "flowbite-svelte";
import images from "./imageData/images.json";

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="max-w-4xl space-y-4">`);

		{
			function slide($$renderer, { index, Slide }) {
				$$renderer.push(`<a${$.attr('href', `http://google.com/search?q=${$.stringify(images[index]?.title)}`)} target="_blank">`);

				if (Slide) {
					$$renderer.push('<!--[-->');
					Slide($$renderer, { image: images[index] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</a>`);
			}

			Carousel($$renderer, { images, duration: 3900, slide, $$slots: { slide: true } });
		}

		$$renderer.push(`<!----></div>`);
	});
}