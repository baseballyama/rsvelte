import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slide from "./Slide.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { onMount } from "svelte";
import { setCarouselContext } from "$lib/context";
import { canChangeSlide } from "./CarouselSlide";
import { carousel } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'slide',
	'images',
	'index',
	'slideDuration',
	'slideFit',
	'transition',
	'duration',
	'aria-label',
	'disableSwipe',
	'imgClass',
	'class',
	'classes',
	'onchange',
	'isPreload'
]);

var root = $.from_html(`<link rel="preload" as="image"/>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Carousel($$anchor, $$props) {
	$.push($$props, true);

	const SLIDE_DURATION_RATIO = 0.25;

	let index = $.prop($$props, 'index', 15, 0),
		slideDuration = $.prop($$props, 'slideDuration', 3, 1000),
		duration = $.prop($$props, 'duration', 3, 0),
		ariaLabel = $.prop($$props, 'aria-label', 3, "Draggable Carousel"),
		disableSwipe = $.prop($$props, 'disableSwipe', 3, false),
		imgClass = $.prop($$props, 'imgClass', 3, ""),
		isPreload = $.prop($$props, 'isPreload', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Carousel", untrack(() => ({ imgClass: imgClass() })), { imgClass: "slide" });

	const styling = $.derived(() => $$props.classes ?? { slide: imgClass() });

	// Theme context
	const theme = $.derived(() => getTheme("carousel"));

	let $$d = $.derived(carousel),
		base = $.derived(() => $.get($$d).base),
		slideCls = $.derived(() => $.get($$d).slide);

	const changeSlide = (n) => {
		if ($$props.images.length === 0) return;
		if (n % $$props.images.length === _state.index) return;

		if (!canChangeSlide({
			lastSlideChange: _state.lastSlideChange,
			slideDuration: _state.slideDuration,
			slideDurationRatio: SLIDE_DURATION_RATIO
		})) return;

		_state.forward = n >= _state.index;
		_state.index = ($$props.images.length + n) % $$props.images.length;
		_state.lastSlideChange = Date.now();
		index(_state.index // Update the bindable index
		);
		$$props.onchange?.($$props.images[_state.index]);
	};

	const _state = $.proxy({
		images: [],
		index: 0,
		forward: true,
		slideDuration: 500,
		lastSlideChange: Date.now(),
		changeSlide
	});

	$.user_effect(() => {
		_state.images = $$props.images;
		_state.slideDuration = slideDuration();
		changeSlide(index());
	});

	setCarouselContext(_state);

	let initialized = false;

	onMount(() => {
		$$props.onchange?.($$props.images[index()]);
		initialized = true;
	});

	const nextSlide = () => changeSlide(_state.index + 1);
	const prevSlide = () => changeSlide(_state.index - 1);

	const loop = () => {
		// loop timer
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		let intervalId;

		if (duration() > 0) {
			intervalId = setInterval(nextSlide, duration());

			if (initialized) {
				if (_state.forward) nextSlide(); else prevSlide();
			}
		}

		return () => clearInterval(intervalId);
	};

	let activeDragGesture = $.state(void 0);
	let carouselDiv = $.state(void 0);
	let percentOffset = $.state(0);
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
		if (disableSwipe()) return;

		/* eslint-disable  @typescript-eslint/no-unused-expressions */
		touchEvent = evt;

		evt.cancelable && evt.preventDefault();

		const start = getPositionFromEvent(evt);
		const width = $.get(carouselDiv)?.getBoundingClientRect().width;

		if (start === undefined || width === undefined) return;

		$.set(activeDragGesture, { start, position: start, width, timestamp: Date.now() }, true);
	};

	let onDragMove = $.derived(() => $.get(activeDragGesture) === undefined
		? undefined
		: (evt) => {
			const position = getPositionFromEvent(evt);

			if (!$.get(activeDragGesture) || position === undefined) return;

			const { start, width } = $.get(activeDragGesture);

			$.set(percentOffset, Math.min(100, Math.max(-100, (position - start) / width * 100)), true);
			$.get(activeDragGesture).position = position;
		});

	let onDragStop = $.derived(() => $.get(activeDragGesture) === undefined
		? undefined
		: () => {
			// These might be exposed one day, keep them safely tucked away as constants.
			const SWIPE_MAX_DURATION = 250;

			const SWIPE_MIN_DISTANCE = 30;
			const DRAG_MIN_PERCENT = 50;

			if ($.get(activeDragGesture)) {
				const { timestamp, position, start } = $.get(activeDragGesture);
				const duration = Date.now() - timestamp;
				const distance = position - start;

				if (Math.abs(distance) >= SWIPE_MIN_DISTANCE && duration <= SWIPE_MAX_DURATION && duration > 0) {
					if (distance > 0) prevSlide(); else nextSlide();
				} else if ($.get(percentOffset) > DRAG_MIN_PERCENT) prevSlide(); else if ($.get(percentOffset) < -DRAG_MIN_PERCENT) nextSlide(); else {
					// Only issue click event for touches
					if (touchEvent?.constructor.name === "TouchEvent") {
						// The gesture is a tap not drag, so manually issue a click event to trigger tap click gestures lost via preventDefault
						touchEvent?.target?.dispatchEvent(new Event("click", { bubbles: true }));
					}
				}
			}

			$.set(percentOffset, 0);
			$.set(activeDragGesture, undefined);
			touchEvent = null;
		});

	var div = root_1();

	$.head('1izk910', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => $$props.images, (image) => image.src, ($$anchor, image) => {
					var link = root();

					$.template_effect(() => $.set_attribute(link, 'href', $.get(image).src));
					$.append($$anchor, link);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (isPreload() && $$props.images.length > 0) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.event('mousemove', $.document, function (...$$args) {
		$.get(onDragMove)?.apply(this, $$args);
	});

	$.event('mouseup', $.document, function (...$$args) {
		$.get(onDragStop)?.apply(this, $$args);
	});

	$.event(
		'touchmove',
		$.document,
		function (...$$args) {
			$.get(onDragMove)?.apply(this, $$args);
		},
		void 0,
		true
	);

	$.event('touchend', $.document, function (...$$args) {
		$.get(onDragStop)?.apply(this, $$args);
	});

	$.attribute_effect(
		div,
		($0) => ({
			onmousedown: onDragStart,
			ontouchstart: onDragStart,
			onmousemove: $.get(onDragMove),
			onmouseup: $.get(onDragStop),
			ontouchmove: $.get(onDragMove),
			ontouchend: $.get(onDragStop),
			role: 'button',
			'aria-label': ariaLabel(),
			tabindex: '0',
			...restProps,
			class: $0
		}),
		[
			() => $.get(base)({
				class: clsx($.get(activeDragGesture) === undefined ? "transition-transform" : "", $.get(theme)?.base, $$props.class)
			})
		]
	);

	var node_2 = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.slide, () => ({ index: _state.index, Slide }));
			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(slideCls)({ class: clsx($.get(theme)?.slide, $.get(styling).slide) }));

				Slide($$anchor, {
					get image() {
						return $$props.images[_state.index];
					},

					get fit() {
						return $$props.slideFit;
					},

					get class() {
						return $.get($0);
					},

					get transition() {
						return $$props.transition;
					}
				});
			}
		};

		$.if(node_2, ($$render) => {
			if ($$props.slide) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	$.snippet(node_4, () => $$props.children ?? $.noop, () => _state.index);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(carouselDiv, $$value), () => $.get(carouselDiv));
	$.attach(div, () => loop);
	$.append($$anchor, div);
	$.pop();
}