import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext
} from '$lib/components/ui/carousel';

import LazyImg from '$lib/core/components/image/lazy-img.svelte';

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center rounded-none bg-gray-200 text-gray-500">No Image</div>`);
var root_1 = $.from_html(`<div class="h-[148px] w-[148px] mobiles:h-[176px] mobiles:w-[176px] mobilem:h-[201px] mobilem:w-[201px] mobilel:h-[245px] mobilel:w-[245px] laptop:h-[230px] laptop:w-[230px]"><!></div>`);
var root_2 = $.from_html(`<!> <div class="absolute left-2 top-1/2 z-30 -translate-y-1/2 translate-x-10 transform"><!></div> <div class="absolute right-2 top-1/2 z-30 -translate-x-10 -translate-y-1/2 transform"><!></div>`, 1);

export default function Images_carousel($$anchor, $$props) {
	let data = $.prop($$props, 'data', 19, () => []);

	Carousel($$anchor, {
		opts: { align: 'center', loop: true },
		class: 'mx-auto w-[90%] py-10 sm:w-[80%]',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CarouselContent(node, {
				class: 'flex flex-row items-center justify-between',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, data, $.index, ($$anchor, image) => {
						CarouselItem($$anchor, {
							class: 'flex-shrink-0 flex-grow-0 basis-auto px-2',
							children: ($$anchor, $$slotProps) => {
								var div = root_1();
								var node_2 = $.child(div);

								{
									var consequent = ($$anchor) => {
										LazyImg($$anchor, {
											get src() {
												return $.get(image);
											},
											alt: 'Image',
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

			var div_2 = $.sibling(node, 2);
			var node_3 = $.child(div_2);

			CarouselPrevious(node_3, {
				class: 'rounded-full bg-white p-2 text-black shadow-md hover:bg-gray-100'
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_4 = $.child(div_3);

			CarouselNext(node_4, {
				class: 'rounded-full bg-white p-2 text-black shadow-md hover:bg-gray-100'
			});

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}