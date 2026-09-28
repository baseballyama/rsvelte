import * as $ from 'svelte/internal/server';
import { Gallery } from "flowbite-svelte";

export default function Featured($$renderer) {
	const image1 = {
		alt: "erbology",
		src: "/images/docs/gallery/featured/image.jpg"
	};

	const images2 = [
		{ alt: "shoes", src: "/images/docs/gallery/square/image-1.jpg" },
		{
			alt: "small bag",
			src: "/images/docs/gallery/square/image-2.jpg"
		},

		{
			alt: "plants",
			src: "/images/docs/gallery/square/image-3.jpg"
		},
		{ alt: "watch", src: "/images/docs/gallery/square/image-4.jpg" },
		{ alt: "shoe", src: "/images/docs/gallery/square/image-5.jpg" }
	];

	let main = { alt: image1.alt, src: image1.src };

	{
		function figure($$renderer, item) {
			$$renderer.push(`<button type="button" class="cursor-pointer rounded-lg border-0 bg-transparent p-0 hover:opacity-80"><img${$.attr('src', item.src)}${$.attr('alt', item.alt)} class="rounded-lg"/></button>`);
		}

		Gallery($$renderer, {
			class: 'gap-4',
			figure,
			children: ($$renderer) => {
				$$renderer.push(`<img${$.attr('src', main.src)}${$.attr('alt', main.alt)} class="h-[450px] w-full rounded-lg bg-gray-100 object-cover"/> `);
				Gallery($$renderer, { class: 'grid-cols-5', items: images2, figure });
				$$renderer.push(`<!---->`);
			},
			$$slots: { figure: true, default: true }
		});
	}
}