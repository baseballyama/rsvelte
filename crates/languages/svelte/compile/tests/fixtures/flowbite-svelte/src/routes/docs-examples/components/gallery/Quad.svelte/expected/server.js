import * as $ from 'svelte/internal/server';
import { Gallery } from "flowbite-svelte";

export default function Quad($$renderer) {
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
		{ alt: "watch", src: "/images/docs/gallery/square/image-4.jpg" }
	];

	Gallery($$renderer, { class: 'grid-cols-2 gap-2', items: images });
}