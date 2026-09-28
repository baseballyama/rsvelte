import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">No Image Available</div>`);
var root_1 = $.from_html(`<div class="card relative mx-auto flex w-full flex-col rounded-lg text-center mobiles:h-[623px] mobiles:w-[355px] tablet:h-[650px] tablet:w-[372px] laptop:h-[789px] laptop:w-[489px] laptopl:h-[642px] laptopl:w-[370px]"><div class="image-container relative mx-auto h-[356px] w-full overflow-hidden mobiles:h-[422px] mobiles:w-[355px] tablet:h-[442px] tablet:w-[372px] laptop:h-[581px] laptop:w-[489px] laptopl:h-[440px] laptopl:w-[370px]"><!></div> <div class="content mt-2 flex flex-grow flex-col px-4 text-center"><h3 class="mb-2 text-[20px] text-black dark:text-gray-100"><a class="hover:text-gray-600 dark:hover:text-gray-300"> </a></h3> <p class="mb-4 flex-grow text-[12px] text-gray-700 dark:text-gray-300"> </p> <div class="mt-auto"><a class="inline-block"><button class="w-[180px] border border-black bg-black px-[15px] py-[10px] text-[14px] font-semibold uppercase text-white transition-colors duration-300 hover:bg-white hover:text-black">SHOP NOW</button></a></div></div></div>`);
var root_2 = $.from_html(`<div class="container mx-auto w-full px-4 py-8 laptop:w-[80%]"><div class="grid w-full grid-cols-1 gap-6 mobiles:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-2 laptopl:grid-cols-3"></div></div>`);

export default function Display_collections($$anchor, $$props) {
	var div = root_2();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $$props.cards, (card) => card.title, ($$anchor, card) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var node = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				LazyImg($$anchor, {
					get src() {
						return $.get(card).src;
					},

					get alt() {
						return $.get(card).title;
					},
					width: '370',
					height: '440',
					class: 'h-full w-full transform object-cover transition-transform duration-300'
				});
			};

			var alternate = ($$anchor) => {
				var div_4 = root();

				$.append($$anchor, div_4);
			};

			$.if(node, ($$render) => {
				if ($.get(card).src) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_3);

		var div_5 = $.sibling(div_3, 2);
		var h3 = $.child(div_5);
		var a = $.child(h3);
		var text = $.only_child(a, true);

		$.reset(h3);

		var p = $.sibling(h3, 2);
		var text_1 = $.only_child(p, true);
		var div_6 = $.sibling(p, 2);
		var a_1 = $.only_child(div_6);

		$.reset(div_5);
		$.reset(div_2);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(card).link);
			$.set_text(text, $.get(card).title);
			$.set_text(text_1, $.get(card).description);
			$.set_attribute(a_1, 'href', $.get(card).link);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}