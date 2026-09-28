import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Spring } from "svelte/motion";

export default function CompareImgBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			firstImage = "/hero_dark.png",
			secondImage = "/hero_light.png",
			class: className = "w-[400px] h-[250px] w-[200px] sm:h-[450px] sm:w-full rounded-tl-(--radius)",
			firstImageClass = "object-cover object-bottom",
			secondImageClass = "object-cover object-bottom",
			initialSliderPercentage = 46,
			slideMode = "hover",
			showHandlebar = true,
			autoplay = false,
			autoplayDuration = 5000
		} = $$props;

		let sliderXPercent = $.derived(() => new Spring(initialSliderPercentage, { stiffness: 0.15 }));
		let isDragging = false;
		let isMouseOver = false;
		let sliderRef = null;
		let autoplayTimeout = null;

		const startAutoplay = () => {
			if (!autoplay) return;

			const startTime = Date.now();

			const animate = () => {
				const elapsedTime = Date.now() - startTime;
				const progress = elapsedTime % (autoplayDuration * 2) / autoplayDuration;
				const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

				sliderXPercent().set(percentage);
				autoplayTimeout = setTimeout(animate, 16); // ~60fps
			};

			animate();
		};

		const stopAutoplay = () => {
			if (autoplayTimeout) {
				clearTimeout(autoplayTimeout);
				autoplayTimeout = null;
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

			if (slideMode === "hover") {
				sliderXPercent().set(initialSliderPercentage);
			}

			if (slideMode === "drag") {
				isDragging = false;
			}

			startAutoplay();
		}

		function handleStart(clientX) {
			if (slideMode === "drag") {
				isDragging = true;
			}
		}

		function handleEnd() {
			if (slideMode === "drag") {
				isDragging = false;
			}
		}

		function handleMove(clientX) {
			if (!sliderRef) return;

			if (slideMode === "hover" || slideMode === "drag" && isDragging) {
				const rect = sliderRef.getBoundingClientRect();
				const x = clientX - rect.left;
				const percent = x / rect.width * 100;

				sliderXPercent().set(Math.max(0, Math.min(100, percent)));
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
			if (!autoplay) {
				handleStart(e.touches[0].clientX);
			}
		}

		function handleTouchEnd() {
			if (!autoplay) {
				handleEnd();
			}
		}

		function handleTouchMove(e) {
			if (!autoplay) {
				handleMove(e.touches[0].clientX);
			}
		}

		$$renderer.push(`<div${$.attr_class(`h-[400px] w-[400px] overflow-hidden ${$.stringify(className)}`)}${$.attr_style(`position: relative; cursor: ${slideMode === 'drag' ? 'grab' : 'col-resize'};`)}><div class="absolute top-0 z-30 m-auto h-full w-px bg-gradient-to-b from-transparent from-[5%] via-indigo-500 to-transparent to-[95%]"${$.attr_style(`left: ${$.stringify(sliderXPercent().current)}%; top: 0; z-index: 40;`)}>`);

		if (showHandlebar) {
			$$renderer.push(`<!--[0--><div class="absolute top-1/2 -right-2.5 z-30 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-white shadow-[0px_-1px_0px_0px_#FFFFFF40]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-black"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="pointer-events-none relative z-20 h-full w-full overflow-hidden">`);

		if (firstImage) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`absolute inset-0 z-20 h-full w-full flex-shrink-0 overflow-hidden rounded-tl-2xl select-none ${$.stringify(firstImageClass)}`)}${$.attr_style(`clip-path: inset(0 ${$.stringify(100 - sliderXPercent().current)}% 0 0);`)}><img alt="first image"${$.attr('src', firstImage)}${$.attr_class($.clsx([
				"absolute inset-0 z-20 h-full  w-full flex-shrink-0 select-none dark:bg-black",
				firstImageClass
			]))} draggable="false"/></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (secondImage) {
			$$renderer.push(`<!--[0--><img${$.attr_class($.clsx([
				"absolute top-0 left-0 z-[19] h-full w-full rounded-tl-3xl select-none",
				secondImageClass
			]))} alt="second image"${$.attr('src', secondImage)} draggable="false"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}