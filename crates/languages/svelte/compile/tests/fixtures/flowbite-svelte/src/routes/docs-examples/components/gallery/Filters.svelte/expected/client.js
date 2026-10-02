import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gallery, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="mx-auto mb-3 flex flex-wrap items-center justify-center gap-2 py-2 md:py-4"><!> <!> <!> <!> <!></div> <!>`, 1);

export default function Filters($$anchor) {
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

	let selectedCategory = $.state("All");

	const filteredImages = $.derived(() => $.get(selectedCategory) === "All"
		? images
		: images.filter((img) => img.category === $.get(selectedCategory)));

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		let $0 = $.derived(() => $.get(selectedCategory) !== "All");

		Button(node, {
			get outline() {
				return $.get($0);
			},
			onclick: () => $.set(selectedCategory, "All"),
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('All categories');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(selectedCategory) !== "Shoes");

		Button(node_1, {
			color: 'alternative',
			get outline() {
				return $.get($0);
			},
			onclick: () => $.set(selectedCategory, "Shoes"),
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Shoes');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(selectedCategory) !== "Bags");

		Button(node_2, {
			color: 'alternative',
			get outline() {
				return $.get($0);
			},
			onclick: () => $.set(selectedCategory, "Bags"),
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Bags');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $.get(selectedCategory) !== "Electronics");

		Button(node_3, {
			color: 'alternative',
			get outline() {
				return $.get($0);
			},
			onclick: () => $.set(selectedCategory, "Electronics"),
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Electronics');

				$.append($$anchor, text_3);
			},
			$$slots: { default: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => $.get(selectedCategory) !== "Gaming");

		Button(node_4, {
			color: 'alternative',
			get outline() {
				return $.get($0);
			},
			onclick: () => $.set(selectedCategory, "Gaming"),
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Gaming');

				$.append($$anchor, text_4);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	Gallery(node_5, {
		get items() {
			return $.get(filteredImages);
		},
		class: 'grid-cols-2 gap-4 md:grid-cols-3'
	});

	$.append($$anchor, fragment);
}