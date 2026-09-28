import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gallery } from "flowbite-svelte";

export default function Quad($$anchor) {
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

	Gallery($$anchor, {
		class: 'grid-cols-2 gap-2',
		get items() {
			return images;
		}
	});
}