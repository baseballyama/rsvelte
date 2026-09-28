import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gallery } from "flowbite-svelte";

var root = $.from_html(`<div class="p-1 ring-4 ring-red-600 dark:ring-red-400"><img class="h-auto max-w-full"/></div>`);

export default function Custom($$anchor) {
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
		const figure = ($$anchor, item = $.noop) => {
			var div = root();
			var img = $.only_child(div);

			$.template_effect(() => {
				$.set_attribute(img, 'src', item().src);
				$.set_attribute(img, 'alt', item().alt);
			});

			$.append($$anchor, div);
		};

		Gallery($$anchor, {
			class: 'grid-cols-3 gap-4',
			get items() {
				return images;
			},
			figure,
			$$slots: { figure: true }
		});
	}
}