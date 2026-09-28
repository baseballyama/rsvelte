import * as $ from 'svelte/internal/server';
import { Gallery } from "flowbite-svelte";

export default function Masonry($$renderer) {
	const images1 = [
		{
			alt: "erbology",
			src: "/images/docs/gallery/masonry/image.jpg"
		},

		{
			alt: "shoes",
			src: "/images/docs/gallery/masonry/image-1.jpg"
		},

		{
			alt: "small bag",
			src: "/images/docs/gallery/masonry/image-2.jpg"
		}
	];

	const images2 = [
		{
			alt: "plants",
			src: "/images/docs/gallery/masonry/image-3.jpg"
		},

		{
			alt: "watch",
			src: "/images/docs/gallery/masonry/image-4.jpg"
		},
		{ alt: "shoe", src: "/images/docs/gallery/masonry/image-5.jpg" }
	];

	const images3 = [
		{
			alt: "cream",
			src: "/images/docs/gallery/masonry/image-6.jpg"
		},

		{
			alt: "small bag",
			src: "/images/docs/gallery/masonry/image-7.jpg"
		},
		{ alt: "lamp", src: "/images/docs/gallery/masonry/image-8.jpg" }
	];

	const images4 = [
		{
			alt: "toiletbag",
			src: "/images/docs/gallery/masonry/image-9.jpg"
		},

		{
			alt: "playstation",
			src: "/images/docs/gallery/masonry/image-10.jpg"
		},
		{ alt: "bag", src: "/images/docs/gallery/masonry/image-11.jpg" }
	];

	Gallery($$renderer, {
		class: 'grid-cols-2 gap-4 md:grid-cols-4',
		children: ($$renderer) => {
			Gallery($$renderer, { items: images1 });
			$$renderer.push(`<!----> `);
			Gallery($$renderer, { items: images2 });
			$$renderer.push(`<!----> `);
			Gallery($$renderer, { items: images3 });
			$$renderer.push(`<!----> `);
			Gallery($$renderer, { items: images4 });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}