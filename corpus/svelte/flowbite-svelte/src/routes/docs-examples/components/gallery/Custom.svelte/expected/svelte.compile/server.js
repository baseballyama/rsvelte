import * as $ from 'svelte/internal/server';
import { Gallery } from "flowbite-svelte";

export default function Custom($$renderer) {
	const images = [
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

	{
		function figure($$renderer, item) {
			$$renderer.push(`<div class="p-1 ring-4 ring-red-600 dark:ring-red-400"><img${$.attr('src', item.src)}${$.attr('alt', item.alt)} class="h-auto max-w-full"/></div>`);
		}

		Gallery($$renderer, {
			class: 'grid-cols-3 gap-4',
			items: images,
			figure,
			$$slots: { figure: true }
		});
	}
}