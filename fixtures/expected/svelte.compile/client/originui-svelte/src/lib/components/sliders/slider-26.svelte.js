import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

const items = [
	{ id: 1, price: 80 },
	{ id: 2, price: 95 },
	{ id: 3, price: 110 },
	{ id: 4, price: 125 },
	{ id: 5, price: 130 },
	{ id: 6, price: 140 },
	{ id: 7, price: 145 },
	{ id: 8, price: 150 },
	{ id: 9, price: 155 },
	{ id: 10, price: 165 },
	{ id: 11, price: 175 },
	{ id: 12, price: 185 },
	{ id: 13, price: 195 },
	{ id: 14, price: 205 },
	{ id: 15, price: 215 },
	{ id: 16, price: 225 },
	{ id: 17, price: 235 },
	{ id: 18, price: 245 },
	{ id: 19, price: 255 },
	{ id: 20, price: 260 },
	{ id: 21, price: 265 },
	{ id: 22, price: 270 },
	{ id: 23, price: 275 },
	{ id: 24, price: 280 },
	{ id: 25, price: 285 },
	{ id: 26, price: 290 },
	{ id: 27, price: 290 },
	{ id: 28, price: 295 },
	{ id: 29, price: 295 },
	{ id: 30, price: 295 },
	{ id: 31, price: 298 },
	{ id: 32, price: 299 },
	{ id: 33, price: 300 },
	{ id: 34, price: 305 },
	{ id: 35, price: 310 },
	{ id: 36, price: 315 },
	{ id: 37, price: 320 },
	{ id: 38, price: 325 },
	{ id: 39, price: 330 },
	{ id: 40, price: 335 },
	{ id: 41, price: 340 },
	{ id: 42, price: 345 },
	{ id: 43, price: 350 },
	{ id: 44, price: 355 },
	{ id: 45, price: 360 },
	{ id: 46, price: 365 },
	{ id: 47, price: 365 },
	{ id: 48, price: 375 },
	{ id: 49, price: 380 },
	{ id: 50, price: 385 },
	{ id: 51, price: 390 },
	{ id: 52, price: 395 },
	{ id: 53, price: 400 },
	{ id: 54, price: 405 },
	{ id: 55, price: 410 },
	{ id: 56, price: 415 },
	{ id: 57, price: 420 },
	{ id: 58, price: 425 },
	{ id: 59, price: 430 },
	{ id: 60, price: 435 },
	{ id: 61, price: 440 },
	{ id: 62, price: 445 },
	{ id: 63, price: 450 },
	{ id: 64, price: 455 },
	{ id: 65, price: 460 },
	{ id: 66, price: 465 },
	{ id: 67, price: 470 },
	{ id: 68, price: 475 },
	{ id: 69, price: 480 },
	{ id: 70, price: 485 },
	{ id: 71, price: 490 },
	{ id: 72, price: 495 },
	{ id: 73, price: 495 },
	{ id: 74, price: 498 },
	{ id: 75, price: 499 },
	{ id: 76, price: 500 },
	{ id: 77, price: 500 },
	{ id: 78, price: 500 },
	{ id: 79, price: 515 },
	{ id: 80, price: 530 },
	{ id: 81, price: 545 },
	{ id: 82, price: 560 },
	{ id: 83, price: 575 },
	{ id: 84, price: 590 },
	{ id: 85, price: 605 },
	{ id: 86, price: 620 },
	{ id: 87, price: 635 },
	{ id: 88, price: 650 },
	{ id: 89, price: 655 },
	{ id: 90, price: 660 },
	{ id: 91, price: 665 },
	{ id: 92, price: 670 },
	{ id: 93, price: 675 },
	{ id: 94, price: 680 },
	{ id: 95, price: 685 },
	{ id: 96, price: 690 },
	{ id: 97, price: 695 },
	{ id: 98, price: 700 },
	{ id: 99, price: 700 },
	{ id: 100, price: 700 },
	{ id: 101, price: 700 },
	{ id: 102, price: 700 },
	{ id: 103, price: 700 },
	{ id: 104, price: 725 },
	{ id: 105, price: 750 },
	{ id: 106, price: 775 },
	{ id: 107, price: 800 },
	{ id: 108, price: 815 },
	{ id: 109, price: 830 },
	{ id: 110, price: 845 },
	{ id: 111, price: 845 },
	{ id: 112, price: 845 },
	{ id: 113, price: 870 },
	{ id: 114, price: 875 },
	{ id: 115, price: 880 },
	{ id: 116, price: 885 },
	{ id: 117, price: 890 },
	{ id: 118, price: 895 },
	{ id: 119, price: 898 },
	{ id: 120, price: 900 }
];

var root = $.from_html(`<div class="flex flex-1 justify-center"><span class="bg-primary/20 h-full w-full"></span></div>`);
var root_1 = $.from_html(`<div class="*:not-first:mt-4"><!> <div><div class="flex h-12 w-full items-end px-3" aria-hidden="true"></div> <!></div> <div class="flex items-center justify-between gap-4"><div class="space-y-1"><!> <div class="relative"><!> <span class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">$</span></div></div> <div class="space-y-1"><!> <div class="relative"><!> <span class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">$</span></div></div></div> <!></div>`);

export default function Slider_26($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy([200, 780]));
	const itemsInRange = $.derived(() => items.filter((item) => item.price >= $.get(value)[0] && item.price <= $.get(value)[1]).length);
	const tickCount = 40;
	const min = Math.min(...items.map((item) => item.price));
	const max = Math.max(...items.map((item) => item.price));
	const priceStep = (max - min) / tickCount;

	const itemCounts = Array.from({ length: tickCount }, (_, tick) => {
		const rangeMin = min + tick * priceStep;
		const rangeMax = min + (tick + 1) * priceStep;

		return items.filter((item) => item.price >= rangeMin && item.price < rangeMax).length;
	});

	const maxCount = Math.max(...itemCounts);

	function isBarInSelectedRange(index) {
		const rangeMin = min + index * priceStep;
		const rangeMax = min + (index + 1) * priceStep;

		return $.get(itemsInRange) > 0 && rangeMin <= $.get(value)[1] && rangeMax >= $.get(value)[0];
	}

	function handleInputChange(e, index) {
		const v = parseFloat(e.currentTarget.value) || 0;

		if (index == 0 && v > $.get(value)[1]) $.set(value, [$.get(value)[1], $.get(value)[1]], true); else if (index == 1 && v < $.get(value)[0]) $.set(value, [$.get(value)[0], $.get(value)[0]], true); else $.get(value)[index] = v;
	}

	var div = root_1();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Price slider');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => itemCounts, $.index, ($$anchor, count, i) => {
		var div_3 = root();
		var span = $.only_child(div_3);

		$.template_effect(
			($0) => {
				$.set_style(div_3, `height: ${$.get(count) / maxCount * 100}%`);
				$.set_attribute(span, 'data-selected', $0);
			},
			[() => isBarInSelectedRange(i)]
		);

		$.append($$anchor, div_3);
	});

	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	Slider(node_1, {
		get min() {
			return min;
		},

		get max() {
			return max;
		},
		'aria-label': 'Price range',
		type: 'multiple',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var node_2 = $.child(div_5);

	Label(node_2, {
		for: 'min-price',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Min price');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var div_6 = $.sibling(node_2, 2);
	var node_3 = $.child(div_6);

	Input(node_3, {
		class: 'peer w-full ps-6',
		type: 'text',
		inputmode: 'decimal',
		onchange: (e) => handleInputChange(e, 0),
		get min() {
			return min;
		},

		get max() {
			return $.get(value)[1];
		},

		get value() {
			return $.get(value)[0];
		},
		'aria-label': 'Enter minimum price'
	});

	$.next(2);
	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var node_4 = $.child(div_7);

	Label(node_4, {
		for: 'max-price',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Max price');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var div_8 = $.sibling(node_4, 2);
	var node_5 = $.child(div_8);

	Input(node_5, {
		class: 'peer w-full ps-6',
		type: 'text',
		inputmode: 'decimal',
		onchange: (e) => handleInputChange(e, 1),
		get min() {
			return $.get(value)[0];
		},

		get max() {
			return max;
		},

		get value() {
			return $.get(value)[1];
		},
		'aria-label': 'Enter maximum price'
	});

	$.next(2);
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_4);

	var node_6 = $.sibling(div_4, 2);

	Button(node_6, {
		class: 'w-full',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, `Show ${$.get(itemsInRange) ?? ''} items`));
			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}