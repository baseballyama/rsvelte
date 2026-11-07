import * as $ from 'svelte/internal/server';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

export default function Carousel($$renderer) {
	const generatedArray = Array.from({ length: 6 });
	let elemCarousel;

	function carouselLeft() {
		if (!elemCarousel) return;

		const x = elemCarousel.scrollLeft === 0
			? elemCarousel.clientWidth * elemCarousel.childElementCount
			: // loop
			elemCarousel.scrollLeft - elemCarousel.clientWidth; // step left

		elemCarousel.scroll(x, 0);
	}

	function carouselRight() {
		if (!elemCarousel) return;

		const x = elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
			? 0
			: // loop
			elemCarousel.scrollLeft + elemCarousel.clientWidth; // step right

		elemCarousel.scroll(x, 0);
	}

	function carouselThumbnail(index) {
		if (elemCarousel) {
			elemCarousel.scroll(elemCarousel.clientWidth * index, 0);
		}
	}

	$$renderer.push(`<div class="w-full"><div class="card p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center"><button type="button" class="btn-icon preset-filled" title="Previous slide" aria-label="Previous slide">`);
	ArrowLeftIcon($$renderer, { size: 16 });
	$$renderer.push(`<!----></button> <div class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto"><!--[-->`);

	const each_array = $.ensure_array_like(generatedArray);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let _ = each_array[i];

		$$renderer.push(`<img class="snap-center w-[1024px] rounded-container"${$.attr('src', `https://picsum.photos/seed/${i + 1}/1024/768`)}${$.attr('alt', `full-${i}`)} loading="lazy"/>`);
	}

	$$renderer.push(`<!--]--></div> <button type="button" class="btn-icon preset-filled" title="Next slide" aria-label="Next slide">`);
	ArrowRightIcon($$renderer, { size: 16 });
	$$renderer.push(`<!----></button></div> <div class="card p-4 grid grid-cols-6 gap-4"><!--[-->`);

	const each_array_1 = $.ensure_array_like(generatedArray);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let _ = each_array_1[i];

		$$renderer.push(`<button type="button"><img class="rounded-container hover:brightness-125"${$.attr('src', `https://picsum.photos/seed/${i + 1}/256`)}${$.attr('alt', `thumb-${i}`)} loading="lazy"/></button>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}