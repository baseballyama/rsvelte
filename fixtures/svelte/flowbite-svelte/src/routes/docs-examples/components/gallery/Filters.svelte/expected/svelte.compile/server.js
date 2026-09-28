import * as $ from 'svelte/internal/server';
import { Gallery, Button } from "flowbite-svelte";

export default function Filters($$renderer) {
	const images = [
		{
			alt: "erbology",
			src: "/images/docs/gallery/square/image.jpg",
			category: "Bags"
		},

		{
			alt: "shoes",
			src: "/images/docs/gallery/square/image-1.jpg",
			category: "Shoes"
		},

		{
			alt: "small bag",
			src: "/images/docs/gallery/square/image-2.jpg",
			category: "Bags"
		},

		{
			alt: "plants",
			src: "/images/docs/gallery/square/image-3.jpg",
			category: "Electronics"
		},

		{
			alt: "watch",
			src: "/images/docs/gallery/square/image-4.jpg",
			category: "Electronics"
		},

		{
			alt: "shoe",
			src: "/images/docs/gallery/square/image-5.jpg",
			category: "Shoes"
		},

		{
			alt: "cream",
			src: "/images/docs/gallery/square/image-6.jpg",
			category: "Bags"
		},

		{
			alt: "small bag",
			src: "/images/docs/gallery/square/image-7.jpg",
			category: "Bags"
		},

		{
			alt: "lamp",
			src: "/images/docs/gallery/square/image-8.jpg",
			category: "Electronics"
		},

		{
			alt: "toiletbag",
			src: "/images/docs/gallery/square/image-9.jpg",
			category: "Bags"
		},

		{
			alt: "playstation",
			src: "/images/docs/gallery/square/image-10.jpg",
			category: "Gaming"
		},

		{
			alt: "bag",
			src: "/images/docs/gallery/square/image-11.jpg",
			category: "Bags"
		}
	];

	let selectedCategory = "All";

	const filteredImages = $.derived(() => selectedCategory === "All"
		? images
		: images.filter((img) => img.category === selectedCategory));

	$$renderer.push(`<div class="mx-auto mb-3 flex flex-wrap items-center justify-center gap-2 py-2 md:py-4">`);

	Button($$renderer, {
		outline: selectedCategory !== "All",
		onclick: () => selectedCategory = "All",
		children: ($$renderer) => {
			$$renderer.push(`<!---->All categories`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'alternative',
		outline: selectedCategory !== "Shoes",
		onclick: () => selectedCategory = "Shoes",
		children: ($$renderer) => {
			$$renderer.push(`<!---->Shoes`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'alternative',
		outline: selectedCategory !== "Bags",
		onclick: () => selectedCategory = "Bags",
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bags`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'alternative',
		outline: selectedCategory !== "Electronics",
		onclick: () => selectedCategory = "Electronics",
		children: ($$renderer) => {
			$$renderer.push(`<!---->Electronics`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'alternative',
		outline: selectedCategory !== "Gaming",
		onclick: () => selectedCategory = "Gaming",
		children: ($$renderer) => {
			$$renderer.push(`<!---->Gaming`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Gallery($$renderer, {
		items: filteredImages(),
		class: 'grid-cols-2 gap-4 md:grid-cols-3'
	});

	$$renderer.push(`<!---->`);
}