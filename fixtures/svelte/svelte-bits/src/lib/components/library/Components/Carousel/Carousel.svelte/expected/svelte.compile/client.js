import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, untrack } from 'svelte';
import { motionValue, animate, transform } from 'motion';

var root = $.from_html(`<span class="block h-2 w-2 rounded-full bg-white"></span>`);
var root_1 = $.from_html(`<div><div><span class="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#120F17]"><!></span></div> <div class="p-5"><div class="mb-1 font-black text-lg text-white"> </div> <p class="text-sm text-white"> </p></div></div>`);
var root_2 = $.from_html(`<button type="button"></button>`);
var root_3 = $.from_html(`<div><div class="flex"></div> <div><div class="mt-4 flex w-[150px] justify-between px-8"></div></div></div>`);

export default function Carousel($$anchor, $$props) {
	$.push($$props, true);

	const DEFAULT_ITEMS = [
		{
			title: 'Text Animations',
			description: 'Cool text animations for your projects.',
			id: 1
		},

		{
			title: 'Animations',
			description: 'Smooth animations for your projects.',
			id: 2
		},

		{
			title: 'Components',
			description: 'Reusable components for your projects.',
			id: 3
		},

		{
			title: 'Backgrounds',
			description: 'Beautiful backgrounds and patterns.',
			id: 4
		},

		{
			title: 'Common UI',
			description: 'Common UI components are coming soon!',
			id: 5
		}
	];

	let items = $.prop($$props, 'items', 3, DEFAULT_ITEMS),
		baseWidth = $.prop($$props, 'baseWidth', 3, 300),
		autoplay = $.prop($$props, 'autoplay', 3, false),
		autoplayDelay = $.prop($$props, 'autoplayDelay', 3, 3000),
		pauseOnHover = $.prop($$props, 'pauseOnHover', 3, false),
		loop = $.prop($$props, 'loop', 3, false),
		round = $.prop($$props, 'round', 3, false);

	const containerPadding = 16;
	const GAP = 16;
	const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };
	const DRAG_BUFFER = 0;
	const VELOCITY_THRESHOLD = 500;
	const itemWidth = $.derived(() => baseWidth() - containerPadding * 2);
	const trackItemOffset = $.derived(() => $.get(itemWidth) + GAP);

	const itemsForRender = $.derived(() => !loop()
		? items()
		: items().length === 0
			? []
			: [items()[items().length - 1], ...items(), items()[0]]);

	let position = $.state($.proxy(loop() ? 1 : 0));
	let isHovered = $.state(false);
	let isJumping = $.state(false);
	let isAnimating = $.state(false);
	const x = motionValue(0);
	let xValue = $.state(0);

	x.on('change', (v) => $.set(xValue, v, true));

	let containerRef;
	let trackRef;
	let currentAnim = null;

	function animateTo(target, duration) {
		currentAnim?.stop?.();

		if (duration === 0) {
			x.set(target);
			handleAnimationComplete();

			return;
		}

		$.set(isAnimating, true);

		currentAnim = animate(x, target, {
			...SPRING_OPTIONS,
			onComplete: () => handleAnimationComplete()
		});
	}

	function handleAnimationComplete() {
		if (!loop() || $.get(itemsForRender).length <= 1) {
			$.set(isAnimating, false);

			return;
		}

		const lastCloneIndex = $.get(itemsForRender).length - 1;

		if ($.get(position) === lastCloneIndex) {
			$.set(isJumping, true);

			const target = 1;

			$.set(position, target);
			x.set(-target * $.get(trackItemOffset));

			requestAnimationFrame(() => {
				$.set(isJumping, false);
				$.set(isAnimating, false);
			});

			return;
		}

		if ($.get(position) === 0) {
			$.set(isJumping, true);

			const target = items().length;

			$.set(position, target, true);
			x.set(-target * $.get(trackItemOffset));

			requestAnimationFrame(() => {
				$.set(isJumping, false);
				$.set(isAnimating, false);
			});

			return;
		}

		$.set(isAnimating, false);
	}

	$.user_effect(() => {
		const target = -$.get(position) * $.get(trackItemOffset);

		if ($.get(isJumping)) {
			x.set(target);

			return;
		}

		untrack(() => animateTo(target));
	});

	$.user_effect(() => {
		void items().length;
		void loop();
		void $.get(trackItemOffset);

		const startingPosition = loop() ? 1 : 0;

		untrack(() => {
			$.set(position, startingPosition, true);
			x.set(-startingPosition * $.get(trackItemOffset));
		});
	});

	onMount(() => {
		if (pauseOnHover() && containerRef) {
			const enter = () => $.set(isHovered, true);
			const leave = () => $.set(isHovered, false);

			containerRef.addEventListener('mouseenter', enter);
			containerRef.addEventListener('mouseleave', leave);

			return () => {
				containerRef.removeEventListener('mouseenter', enter);
				containerRef.removeEventListener('mouseleave', leave);
			};
		}
	});

	$.user_effect(() => {
		if (!autoplay() || $.get(itemsForRender).length <= 1) return;
		if (pauseOnHover() && $.get(isHovered)) return;

		const id = setInterval(
			() => {
				$.set(position, Math.min($.get(position) + 1, $.get(itemsForRender).length - 1), true);
			},
			autoplayDelay()
		);

		return () => clearInterval(id);
	});

	// Custom drag
	let dragStartX = 0;

	let dragStartT = 0;
	let dragging = $.state(false);
	let dragOffset = 0;

	function onPointerDown(e) {
		if ($.get(isAnimating)) return;

		$.set(dragging, true);
		dragStartX = e.clientX;
		dragStartT = performance.now();
		dragOffset = 0;
		currentAnim?.stop?.();
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function onPointerMove(e) {
		if (!$.get(dragging)) return;

		dragOffset = e.clientX - dragStartX;
		x.set(-$.get(position) * $.get(trackItemOffset) + dragOffset);
	}

	function onPointerUp(e) {
		if (!$.get(dragging)) return;

		$.set(dragging, false);

		const dt = Math.max(1, performance.now() - dragStartT);
		const velocity = dragOffset / dt * 1000;

		const direction = dragOffset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD
			? 1
			: dragOffset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD ? -1 : 0;

		e.currentTarget.releasePointerCapture(e.pointerId);

		if (direction === 0) {
			animateTo(-$.get(position) * $.get(trackItemOffset));

			return;
		}

		const next = $.get(position) + direction;
		const max = $.get(itemsForRender).length - 1;

		$.set(position, Math.max(0, Math.min(next, max)), true);
	}

	const activeIndex = $.derived(() => items().length === 0
		? 0
		: loop()
			? ($.get(position) - 1 + items().length) % items().length
			: Math.min($.get(position), items().length - 1));

	function rotateForIndex(index) {
		const range = [
			-(index + 1) * $.get(trackItemOffset),
			-index * $.get(trackItemOffset),
			-(index - 1) * $.get(trackItemOffset)
		];

		return transform(range, [90, 0, -90], { clamp: false })($.get(xValue));
	}

	var div = root_3();
	var div_1 = $.child(div);

	$.each(div_1, 23, () => $.get(itemsForRender), (item, index) => `${item?.id ?? index}-${index}`, ($$anchor, item, index) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var span = $.child(div_3);
		var node = $.child(span);

		{
			var consequent = ($$anchor) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $.get(item).icon);
				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				var span_1 = root();

				$.append($$anchor, span_1);
			};

			$.if(node, ($$render) => {
				if ($.get(item).icon) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(span);
		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var div_5 = $.child(div_4);
		var text = $.only_child(div_5, true);
		var p = $.sibling(div_5, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_4);
		$.reset(div_2);

		$.template_effect(
			($0) => {
				$.set_class(div_2, 1, `relative shrink-0 flex flex-col ${round()
					? 'items-center justify-center text-center bg-[#120F17] border-0'
					: 'items-start justify-between bg-[#222] border border-[#222] rounded-[12px]'} overflow-hidden`);

				$.set_style(div_2, `width:${$.get(itemWidth) ?? ''}px; height:${round() ? `${$.get(itemWidth)}px` : '100%'}; transform: rotateY(${$0 ?? ''}deg); ${round() ? 'border-radius:50%;' : ''}`);
				$.set_class(div_3, 1, $.clsx(round() ? 'p-0 m-0' : 'mb-4 p-5'));
				$.set_text(text, $.get(item).title);
				$.set_text(text_1, $.get(item).description);
			},
			[() => rotateForIndex($.get(index)).toFixed(3)]
		);

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => trackRef = $$value, () => trackRef);

	var div_6 = $.sibling(div_1, 2);
	var div_7 = $.child(div_6);

	$.each(div_7, 21, items, $.index, ($$anchor, _, index) => {
		var button = root_2();

		$.set_attribute(button, 'aria-label', `Go to slide ${index + 1}`);

		$.template_effect(() => {
			$.set_class(button, 1, `h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${$.get(activeIndex) === index
				? round() ? 'bg-white' : 'bg-[#333333]'
				: round() ? 'bg-[#555]' : 'bg-[rgba(51,51,51,0.4)]'}`);

			$.set_style(button, `transform:scale(${$.get(activeIndex) === index ? 1.2 : 1}); transition: transform 0.15s, background-color 0.15s; border:0;`);
		});

		$.delegated('click', button, () => $.set(position, loop() ? index + 1 : index, true));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);

	$.template_effect(() => {
		$.set_class(div, 1, `relative overflow-hidden p-4 ${round()
			? 'rounded-full border border-white'
			: 'rounded-[24px] border border-[#222]'}`);

		$.set_style(div, `width:${baseWidth() ?? ''}px; ${round() ? `height:${baseWidth()}px;` : ''}`);
		$.set_style(div_1, `width:${$.get(itemWidth) ?? ''}px; gap:16px; perspective:1000px; perspective-origin:${$.get(position) * $.get(trackItemOffset) + $.get(itemWidth) / 2}px 50%; transform:translate3d(${$.get(xValue) ?? ''}px, 0, 0); cursor:${$.get(dragging) ? 'grabbing' : 'grab'};`);

		$.set_class(div_6, 1, `flex w-full justify-center ${round()
			? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2'
			: ''}`);
	});

	$.delegated('pointerdown', div_1, onPointerDown);
	$.delegated('pointermove', div_1, onPointerMove);
	$.delegated('pointerup', div_1, onPointerUp);
	$.event('pointercancel', div_1, onPointerUp);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['pointerdown', 'pointermove', 'pointerup', 'click']);