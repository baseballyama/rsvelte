import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gallery } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Masonry($$anchor) {
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

	Gallery($$anchor, {
		class: 'grid-cols-2 gap-4 md:grid-cols-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Gallery(node, {
				get items() {
					return images1;
				}
			});

			var node_1 = $.sibling(node, 2);

			Gallery(node_1, {
				get items() {
					return images2;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Gallery(node_2, {
				get items() {
					return images3;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Gallery(node_3, {
				get items() {
					return images4;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}