import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious
} from '$lib/components/ui/carousel';

import LazyImg from '$lib/core/components/image/lazy-img.svelte';

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center rounded-none bg-gray-200 text-gray-500">No Image</div>`);
var root_1 = $.from_html(`<div class="h-[74px] w-[186px]"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Brands_carousel($$anchor, $$props) {
	let data = $.prop($$props, 'data', 19, () => []);

	Carousel($$anchor, {
		opts: { align: 'center', loop: true, dragFree: true },
		class: 'mx-auto w-full py-10 sm:w-[90%] laptop:w-[80%]',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CarouselContent(node, {
				class: '-ml-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, data, $.index, ($$anchor, image) => {
						CarouselItem($$anchor, {
							class: 'md:basis-1/5',
							children: ($$anchor, $$slotProps) => {
								var div = root_1();
								var node_2 = $.child(div);

								{
									var consequent = ($$anchor) => {
										LazyImg($$anchor, {
											get src() {
												return $.get(image);
											},
											alt: 'Featured brand partner logo',
											class: 'h-full w-full rounded-none object-cover'
										});
									};

									var alternate = ($$anchor) => {
										var div_1 = root();

										$.append($$anchor, div_1);
									};

									$.if(node_2, ($$render) => {
										if ($.get(image)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.reset(div);
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CarouselPrevious(node_3, {
				class: 'absolute left-0 top-1/2 z-30 m-[5px] h-10 w-10 -translate-y-1/2 transform bg-white text-black sm:-left-4'
			});

			var node_4 = $.sibling(node_3, 2);

			CarouselNext(node_4, {
				class: 'absolute right-0 top-1/2 z-30 m-[5px] h-10 w-10 -translate-y-1/2 transform bg-white text-black sm:-right-4'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}