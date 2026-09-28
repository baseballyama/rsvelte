import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

var root = $.from_html(`<img class="snap-center w-[1024px] rounded-container" loading="lazy"/>`);
var root_1 = $.from_html(`<button type="button"><img class="rounded-container hover:brightness-125" loading="lazy"/></button>`);
var root_2 = $.from_html(`<div class="w-full"><div class="card p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center"><button type="button" class="btn-icon preset-filled" title="Previous slide" aria-label="Previous slide"><!></button> <div class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto"></div> <button type="button" class="btn-icon preset-filled" title="Next slide" aria-label="Next slide"><!></button></div> <div class="card p-4 grid grid-cols-6 gap-4"></div></div>`);

export default function Carousel($$anchor) {
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

	var div = root_2();
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var node = $.child(button);

	ArrowLeftIcon(node, { size: 16 });
	$.reset(button);

	var div_2 = $.sibling(button, 2);

	$.each(div_2, 21, () => generatedArray, $.index, ($$anchor, _, i) => {
		var img = root();

		$.set_attribute(img, 'src', `https://picsum.photos/seed/${i + 1}/1024/768`);
		$.set_attribute(img, 'alt', `full-${i}`);
		$.append($$anchor, img);
	});

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => elemCarousel = $$value, () => elemCarousel);

	var button_1 = $.sibling(div_2, 2);
	var node_1 = $.child(button_1);

	ArrowRightIcon(node_1, { size: 16 });
	$.reset(button_1);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);

	$.each(div_3, 21, () => generatedArray, $.index, ($$anchor, _, i) => {
		var button_2 = root_1();
		var img_1 = $.child(button_2);

		$.set_attribute(img_1, 'src', `https://picsum.photos/seed/${i + 1}/256`);
		$.set_attribute(img_1, 'alt', `thumb-${i}`);
		$.reset(button_2);
		$.delegated('click', button_2, () => carouselThumbnail(i));
		$.append($$anchor, button_2);
	});

	$.reset(div_3);
	$.reset(div);
	$.delegated('click', button, carouselLeft);
	$.delegated('click', button_1, carouselRight);
	$.append($$anchor, div);
}

$.delegate(['click']);