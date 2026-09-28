import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import AutoScroll from 'embla-carousel-auto-scroll';
import EmblaCarousel from 'embla-carousel';
import { page } from '$app/state';

var root = $.from_html(`<div class="embla__slide flex items-center justify-between whitespace-nowrap text-center svelte-rwgio5"><p></p> <div class="flex flex-grow justify-evenly"><div class="h-[1px] w-[60%] border-[2px] border-b border-gray-300"></div></div></div>`);
var root_1 = $.from_html(`<div class="relative w-full"><div class="embla flex h-12 w-full gap-4 bg-black text-white svelte-rwgio5"><div class="embla__container svelte-rwgio5"></div></div></div>`);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

	let carouselApi = $.state(null);
	let emblaNode = $.state(null);
	const newsTickerPlugin = $.derived(() => page.data?.store?.plugins?.newsTicker);

	onMount(() => {
		if (!$.get(emblaNode)) return;

		$.set(
			carouselApi,
			EmblaCarousel(
				$.get(emblaNode),
				{
					axis: 'x',
					loop: true,
					duration: 20, // Faster snap animation
					startIndex: 0,
					align: 'center'
				},
				[AutoScroll({ playOnInit: true })]
			),
			true
		);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);

			$.each(div_2, 20, () => ({ length: 10 }), $.index, ($$anchor, _) => {
				var div_3 = root();
				var p = $.child(div_3);

				$.html(p, () => $.get(newsTickerPlugin).html, true);
				$.reset(p);
				$.next(2);
				$.reset(div_3);
				$.append($$anchor, div_3);
			});

			$.reset(div_2);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(emblaNode, $$value), () => $.get(emblaNode));
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(newsTickerPlugin)?.active) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}