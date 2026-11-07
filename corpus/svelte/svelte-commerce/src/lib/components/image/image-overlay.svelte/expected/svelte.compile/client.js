import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex h-[660px] w-full items-center justify-center bg-gray-300 text-gray-500 sm:h-full sm:w-full">Image Not Available</div>`);
var root_2 = $.from_html(`<div class="group relative my-5 w-full"><div class="absolute right-0 top-[47%] z-10 flex h-fit w-auto -translate-y-[47%] transform flex-col items-center justify-center p-[25px] text-center mobilem:w-[375px] mobilel:w-[425px] tablet:right-[50px] laptop:right-[10%] laptop:-translate-x-[10%]"><div class="mb-[15px] flex flex-col mobiles:mb-[20px]"><h2 class="pb-[5px] text-[24px] font-bold uppercase tracking-wider text-white mobiles:pb-[12px] tablet:text-black laptop:text-[40px]"> </h2> <div class="mx-auto h-[2px] w-[40px] bg-white tablet:bg-black laptop:h-[2.5px]"></div></div> <p class="mb-[20px] text-[12px] text-white tablet:text-black laptop:mb-[30px]"> </p> <a class="inline-block"><button class="w-[180px] border border-black bg-black px-[15px] py-[10px] text-[14px] font-semibold uppercase text-white transition-colors duration-300 hover:bg-white hover:text-black"> </button></a></div> <!></div>`);

export default function Image_overlay($$anchor, $$props) {
	let imgAlt = $.prop($$props, 'imgAlt', 3, 'Default alt text'),
		side = $.prop($$props, 'side', 3, 'left');

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h2 = $.child(div_2);
	var text = $.only_child(h2, true);

	$.next(2);
	$.reset(div_2);

	var p = $.sibling(div_2, 2);
	var text_1 = $.only_child(p, true);
	var a = $.sibling(p, 2);
	var button = $.child(a);
	var text_2 = $.only_child(button, true);

	$.reset(a);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			{
				let $0 = $.derived(() => side() === 'left' ? 'object-[70%]' : '');

				LazyImg(node_1, {
					get src() {
						return $$props.imgSrc;
					},

					get alt() {
						return imgAlt();
					},

					get class() {
						return `h-fit w-full object-cover sm:h-full sm:w-full sm:object-contain sm:object-[center] ${$.get($0) ?? ''} hidden tablet:block`;
					}
				});
			}

			var node_2 = $.sibling(node_1, 2);

			LazyImg(node_2, {
				src: 'https://new-ella-demo.myshopify.com/cdn/shop/files/banner-1-mb-min.jpg?v=1632459215&width=750',
				get alt() {
					return imgAlt();
				},
				class: 'h-fit w-full object-cover tablet:hidden'
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_1();

			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($$props.imgSrc) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
		$.set_attribute(a, 'href', $$props.link);
		$.set_text(text_2, $$props.buttonText);
	});

	$.append($$anchor, div);
}