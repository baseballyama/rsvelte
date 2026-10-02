import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Spring } from "svelte/motion";

var root = $.from_html(`<div class="absolute top-1/2 -right-2.5 z-30 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-white shadow-[0px_-1px_0px_0px_#FFFFFF40]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-black"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></div>`);
var root_1 = $.from_html(`<div><img alt="first image" draggable="false"/></div>`);
var root_2 = $.from_html(`<img alt="second image" draggable="false"/>`);
var root_3 = $.from_html(`<div><div class="absolute top-0 z-30 m-auto h-full w-px bg-gradient-to-b from-transparent from-[5%] via-indigo-500 to-transparent to-[95%]"><!></div> <div class="pointer-events-none relative z-20 h-full w-full overflow-hidden"><!></div> <!></div>`);

export default function CompareImgBlock($$anchor, $$props) {
	$.push($$props, true);

	let firstImage = $.prop($$props, 'firstImage', 3, "/hero_dark.png"),
		secondImage = $.prop($$props, 'secondImage', 3, "/hero_light.png"),
		className = $.prop($$props, 'class', 3, "w-[400px] h-[250px] w-[200px] sm:h-[450px] sm:w-full rounded-tl-(--radius)"),
		firstImageClass = $.prop($$props, 'firstImageClass', 3, "object-cover object-bottom"),
		secondImageClass = $.prop($$props, 'secondImageClass', 3, "object-cover object-bottom"),
		initialSliderPercentage = $.prop($$props, 'initialSliderPercentage', 3, 46),
		slideMode = $.prop($$props, 'slideMode', 3, "hover"),
		showHandlebar = $.prop($$props, 'showHandlebar', 3, true),
		autoplay = $.prop($$props, 'autoplay', 3, false),
		autoplayDuration = $.prop($$props, 'autoplayDuration', 3, 5000);

	let sliderXPercent = $.derived(() => new Spring(initialSliderPercentage(), { stiffness: 0.15 }));
	let isDragging = false;
	let isMouseOver = false;
	let sliderRef = $.state(null);
	let autoplayTimeout = $.state(null);

	const startAutoplay = () => {
		if (!autoplay()) return;

		const startTime = Date.now();

		const animate = () => {
			const elapsedTime = Date.now() - startTime;
			const progress = elapsedTime % (autoplayDuration() * 2) / autoplayDuration();
			const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

			$.get(sliderXPercent).set(percentage);

			$.set(
				autoplayTimeout,
				setTimeout(animate, 16), // ~60fps
				true
			);
		};

		animate();
	};

	const stopAutoplay = () => {
		if ($.get(autoplayTimeout)) {
			clearTimeout($.get(autoplayTimeout));
			$.set(autoplayTimeout, null);
		}
	};

	onMount(() => {
		startAutoplay();

		return stopAutoplay;
	});

	function mouseEnterHandler() {
		isMouseOver = true;
		stopAutoplay();
	}

	function mouseLeaveHandler() {
		isMouseOver = false;

		if (slideMode() === "hover") {
			$.get(sliderXPercent).set(initialSliderPercentage());
		}

		if (slideMode() === "drag") {
			isDragging = false;
		}

		startAutoplay();
	}

	function handleStart(clientX) {
		if (slideMode() === "drag") {
			isDragging = true;
		}
	}

	function handleEnd() {
		if (slideMode() === "drag") {
			isDragging = false;
		}
	}

	function handleMove(clientX) {
		if (!$.get(sliderRef)) return;

		if (slideMode() === "hover" || slideMode() === "drag" && isDragging) {
			const rect = $.get(sliderRef).getBoundingClientRect();
			const x = clientX - rect.left;
			const percent = x / rect.width * 100;

			$.get(sliderXPercent).set(Math.max(0, Math.min(100, percent)));
		}
	}

	function handleMouseDown(e) {
		handleStart(e.clientX);
	}

	function handleMouseUp() {
		handleEnd();
	}

	function handleMouseMove(e) {
		handleMove(e.clientX);
	}

	function handleTouchStart(e) {
		if (!autoplay()) {
			handleStart(e.touches[0].clientX);
		}
	}

	function handleTouchEnd() {
		if (!autoplay()) {
			handleEnd();
		}
	}

	function handleTouchMove(e) {
		if (!autoplay()) {
			handleMove(e.touches[0].clientX);
		}
	}

	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (showHandlebar()) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();
			var img = $.only_child(div_4);

			$.template_effect(() => {
				$.set_class(div_4, 1, `absolute inset-0 z-20 h-full w-full flex-shrink-0 overflow-hidden rounded-tl-2xl select-none ${firstImageClass() ?? ''}`);
				$.set_style(div_4, `clip-path: inset(0 ${100 - $.get(sliderXPercent).current}% 0 0);`);
				$.set_attribute(img, 'src', firstImage());

				$.set_class(img, 1, $.clsx([
					"absolute inset-0 z-20 h-full  w-full flex-shrink-0 select-none dark:bg-black",
					firstImageClass()
				]));
			});

			$.append($$anchor, div_4);
		};

		$.if(node_1, ($$render) => {
			if (firstImage()) $$render(consequent_1);
		});
	}

	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var img_1 = root_2();

			$.template_effect(() => {
				$.set_class(img_1, 1, $.clsx([
					"absolute top-0 left-0 z-[19] h-full w-full rounded-tl-3xl select-none",
					secondImageClass()
				]));

				$.set_attribute(img_1, 'src', secondImage());
			});

			$.append($$anchor, img_1);
		};

		$.if(node_2, ($$render) => {
			if (secondImage()) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(sliderRef, $$value), () => $.get(sliderRef));

	$.template_effect(() => {
		$.set_class(div, 1, `h-[400px] w-[400px] overflow-hidden ${className() ?? ''}`);
		$.set_style(div, `position: relative; cursor: ${slideMode() === 'drag' ? 'grab' : 'col-resize'};`);
		$.set_style(div_1, `left: ${$.get(sliderXPercent).current ?? ''}%; top: 0; z-index: 40;`);
	});

	$.delegated('mousemove', div, handleMouseMove);
	$.event('mouseleave', div, mouseLeaveHandler);
	$.event('mouseenter', div, mouseEnterHandler);
	$.delegated('mousedown', div, handleMouseDown);
	$.delegated('mouseup', div, handleMouseUp);
	$.delegated('touchstart', div, handleTouchStart, void 0, true);
	$.delegated('touchend', div, handleTouchEnd);
	$.delegated('touchmove', div, handleTouchMove, void 0, true);
	$.append($$anchor, div);
	$.pop();
}

$.delegate([
	'mousemove',
	'mousedown',
	'mouseup',
	'touchstart',
	'touchend',
	'touchmove'
]);