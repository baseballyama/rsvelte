import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gallery } from "flowbite-svelte";

var root = $.from_html(`<button type="button" class="cursor-pointer rounded-lg border-0 bg-transparent p-0 hover:opacity-80"><img class="rounded-lg"/></button>`);
var root_1 = $.from_html(`<img class="h-[450px] w-full rounded-lg bg-gray-100 object-cover"/> <!>`, 1);

export default function Featured($$anchor) {
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

	let main = $.state($.proxy({ alt: image1.alt, src: image1.src }));

	{
		const figure = ($$anchor, item = $.noop) => {
			var button = root();
			var img = $.only_child(button);

			$.template_effect(() => {
				$.set_attribute(img, 'src', item().src);
				$.set_attribute(img, 'alt', item().alt);
			});

			$.delegated('click', button, () => $.set(main, item(), true));
			$.append($$anchor, button);
		};

		Gallery($$anchor, {
			class: 'gap-4',
			figure,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var img_1 = $.first_child(fragment_1);
				var node = $.sibling(img_1, 2);

				Gallery(node, {
					class: 'grid-cols-5',
					get items() {
						return images2;
					},

					get figure() {
						return figure;
					}
				});

				$.template_effect(() => {
					$.set_attribute(img_1, 'src', $.get(main).src);
					$.set_attribute(img_1, 'alt', $.get(main).alt);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { figure: true, default: true }
		});
	}
}

$.delegate(['click']);