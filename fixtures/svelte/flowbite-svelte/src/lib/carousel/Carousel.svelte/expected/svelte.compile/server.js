import * as $ from 'svelte/internal/server';
import Slide from "./Slide.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { onMount } from "svelte";
import { setCarouselContext } from "$lib/context";
import { canChangeSlide } from "./CarouselSlide";
import { carousel } from "./theme";
import { untrack } from "svelte";

export default function Carousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const SLIDE_DURATION_RATIO = 0.25;

		let {
			children,
			slide,
			images,
			index = 0,
			slideDuration = 1000,
			slideFit,
			transition,
			duration = 0,
			"aria-label": ariaLabel = "Draggable Carousel",
			disableSwipe = false,
			imgClass = "",
			class: className,
			classes,
			onchange,
			isPreload = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Carousel", untrack(() => ({ imgClass })), { imgClass: "slide" });

		const styling = $.derived(() => classes ?? { slide: imgClass });

		// Theme context
		const theme = $.derived(() => getTheme("carousel"));

		let $$d = $.derived(carousel),
			base = $.derived(() => $$d().base),
			slideCls = $.derived(() => $$d().slide);

		const changeSlide = (n) => {
			if (images.length === 0) return;
			if (n % images.length === _state.index) return;

			if (!canChangeSlide({
				lastSlideChange: _state.lastSlideChange,
				slideDuration: _state.slideDuration,
				slideDurationRatio: SLIDE_DURATION_RATIO
			})) return;

			_state.forward = n >= _state.index;
			_state.index = (images.length + n) % images.length;
			_state.lastSlideChange = Date.now();
			index = _state.index; // Update the bindable index
			onchange?.(images[_state.index]);
		};

		const _state = {
			images: [],
			index: 0,
			forward: true,
			slideDuration: 500,
			lastSlideChange: Date.now(),
			changeSlide
		};

		setCarouselContext(_state);

		let initialized = false;

		onMount(() => {
			onchange?.(images[index]);
			initialized = true;
		});

		const nextSlide = () => changeSlide(_state.index + 1);
		const prevSlide = () => changeSlide(_state.index - 1);

		const loop = () => {
			// loop timer
			/* eslint-disable  @typescript-eslint/no-explicit-any */
			let intervalId;

			if (duration > 0) {
				intervalId = setInterval(nextSlide, duration);

				if (initialized) {
					if (_state.forward) nextSlide(); else prevSlide();
				}
			}

			return () => clearInterval(intervalId);
		};

		let activeDragGesture = void 0;
		let carouselDiv = void 0;
		let percentOffset = 0;
		let touchEvent = null;

		const getPositionFromEvent = (evt) => {
			const mousePos = evt?.clientX;

			if (mousePos !== undefined) return mousePos;

			let touchEvt = evt;

			if ((/^touch/).test(touchEvt?.type)) {
				return touchEvt.touches[0].clientX;
			}
		};

		const onDragStart = (evt) => {
			if (disableSwipe) return;

			/* eslint-disable  @typescript-eslint/no-unused-expressions */
			touchEvent = evt;

			evt.cancelable && evt.preventDefault();

			const start = getPositionFromEvent(evt);
			const width = carouselDiv?.getBoundingClientRect().width;

			if (start === undefined || width === undefined) return;

			activeDragGesture = { start, position: start, width, timestamp: Date.now() };
		};

		let onDragMove = $.derived(() => activeDragGesture === undefined
			? undefined
			: (evt) => {
				const position = getPositionFromEvent(evt);

				if (!activeDragGesture || position === undefined) return;

				const { start, width } = activeDragGesture;

				percentOffset = Math.min(100, Math.max(-100, (position - start) / width * 100));
				activeDragGesture.position = position;
			});

		let onDragStop = $.derived(() => activeDragGesture === undefined
			? undefined
			: () => {
				// These might be exposed one day, keep them safely tucked away as constants.
				const SWIPE_MAX_DURATION = 250;

				const SWIPE_MIN_DISTANCE = 30;
				const DRAG_MIN_PERCENT = 50;

				if (activeDragGesture) {
					const { timestamp, position, start } = activeDragGesture;
					const duration = Date.now() - timestamp;
					const distance = position - start;

					if (Math.abs(distance) >= SWIPE_MIN_DISTANCE && duration <= SWIPE_MAX_DURATION && duration > 0) {
						if (distance > 0) prevSlide(); else nextSlide();
					} else if (percentOffset > DRAG_MIN_PERCENT) prevSlide(); else if (percentOffset < -DRAG_MIN_PERCENT) nextSlide(); else {
						// Only issue click event for touches
						if (touchEvent?.constructor.name === "TouchEvent") {
							// The gesture is a tap not drag, so manually issue a click event to trigger tap click gestures lost via preventDefault
							touchEvent?.target?.dispatchEvent(new Event("click", { bubbles: true }));
						}
					}
				}

				percentOffset = 0;
				activeDragGesture = undefined;
				touchEvent = null;
			});

		$.head('1izk910', $$renderer, ($$renderer) => {
			if (isPreload && images.length > 0) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(images);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let image = each_array[$$index];

					$$renderer.push(`<link rel="preload"${$.attr('href', image.src)} as="image"/>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div${$.attributes({
			role: 'button',
			'aria-label': ariaLabel,
			tabindex: '0',
			...restProps,
			class: $.clsx(base()({
				class: clsx(activeDragGesture === undefined ? "transition-transform" : "", theme()?.base, className)
			}))
		})}>`);

		if (slide) {
			$$renderer.push('<!--[0-->');
			slide($$renderer, { index: _state.index, Slide });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			Slide($$renderer, {
				image: images[_state.index],
				fit: slideFit,
				class: slideCls()({ class: clsx(theme()?.slide, styling().slide) }),
				transition
			});
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer, _state.index);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { index });
	});
}