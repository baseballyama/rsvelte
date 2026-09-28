import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<div class="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none"></div>`);
var root_1 = $.from_html(`<div class="absolute box-content" style="will-change:transform,width,height,opacity;" role="presentation"><div class="relative w-full h-full bg-cover bg-center rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] uppercase text-[10px] leading-[10px]"><!></div></div>`);
var root_2 = $.from_html(`<div class="relative w-full h-full"></div>`);

export default function Masonry($$anchor, $$props) {
	$.push($$props, true);

	let ease = $.prop($$props, 'ease', 3, 'power3.out'),
		duration = $.prop($$props, 'duration', 3, 0.6),
		stagger = $.prop($$props, 'stagger', 3, 0.05),
		animateFrom = $.prop($$props, 'animateFrom', 3, 'bottom'),
		scaleOnHover = $.prop($$props, 'scaleOnHover', 3, true),
		hoverScale = $.prop($$props, 'hoverScale', 3, 0.95),
		blurToFocus = $.prop($$props, 'blurToFocus', 3, true),
		colorShiftOnHover = $.prop($$props, 'colorShiftOnHover', 3, false);

	let containerRef;
	let width = $.state(0);
	let columns = $.state(1);
	let imagesReady = $.state(false);
	let hasMounted = false;

	function computeColumns() {
		if (typeof window === 'undefined') return 1;
		if (matchMedia('(min-width:1500px)').matches) return 5;
		if (matchMedia('(min-width:1000px)').matches) return 4;
		if (matchMedia('(min-width:600px)').matches) return 3;
		if (matchMedia('(min-width:400px)').matches) return 2;

		return 1;
	}

	const grid = $.derived(() => {
		if (!$.get(width)) return [];

		const colHeights = new Array($.get(columns)).fill(0);
		const gap = 16;
		const totalGaps = ($.get(columns) - 1) * gap;
		const columnWidth = ($.get(width) - totalGaps) / $.get(columns);

		return $$props.items.map((child) => {
			const col = colHeights.indexOf(Math.min(...colHeights));
			const x = col * (columnWidth + gap);
			const height = child.height / 2;
			const y = colHeights[col];

			colHeights[col] += height + gap;

			return { ...child, x, y, w: columnWidth, h: height };
		});
	});

	function getInitialPosition(item) {
		const containerRect = containerRef?.getBoundingClientRect();

		if (!containerRect) return { x: item.x, y: item.y };

		let direction = animateFrom();

		if (animateFrom() === 'random') {
			const dirs = ['top', 'bottom', 'left', 'right'];

			direction = dirs[Math.floor(Math.random() * dirs.length)];
		}

		switch (direction) {
			case 'top':
				return { x: item.x, y: -200 };

			case 'bottom':
				return { x: item.x, y: window.innerHeight + 200 };

			case 'left':
				return { x: -200, y: item.y };

			case 'right':
				return { x: window.innerWidth + 200, y: item.y };

			case 'center':
				return {
					x: containerRect.width / 2 - item.w / 2,
					y: containerRect.height / 2 - item.h / 2
				};

			default:
				return { x: item.x, y: item.y + 100 };
		}
	}

	async function preloadImages(urls) {
		await Promise.all(urls.map((src) => new Promise((resolve) => {
			const img = new Image();

			img.src = src;
			img.onload = img.onerror = () => resolve();
		})));
	}

	$.user_effect(() => {
		void $$props.items;
		$.set(imagesReady, false);
		preloadImages($$props.items.map((i) => i.img)).then(() => $.set(imagesReady, true));
	});

	$.user_effect(() => {
		if (!$.get(imagesReady) || !$.get(grid).length) return;

		(async () => {
			await tick();

			$.get(grid).forEach((item, index) => {
				const selector = `[data-key="${item.id}"]`;
				const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

				if (!hasMounted) {
					const start = getInitialPosition(item);

					gsap.fromTo(
						selector,
						{
							opacity: 0,
							x: start.x,
							y: start.y,
							width: item.w,
							height: item.h,
							...blurToFocus() && { filter: 'blur(10px)' }
						},
						{
							opacity: 1,
							...animProps,
							...blurToFocus() && { filter: 'blur(0px)' },
							duration: 0.8,
							ease: 'power3.out',
							delay: index * stagger()
						}
					);
				} else {
					gsap.to(selector, {
						...animProps,
						duration: duration(),
						ease: ease(),
						overwrite: 'auto'
					});
				}
			});

			hasMounted = true;
		})();
	});

	function handleEnter(id, el) {
		if (scaleOnHover()) gsap.to(`[data-key="${id}"]`, { scale: hoverScale(), duration: 0.3, ease: 'power2.out' });

		if (colorShiftOnHover()) {
			const overlay = el.querySelector('.color-overlay');

			if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
		}
	}

	function handleLeave(id, el) {
		if (scaleOnHover()) gsap.to(`[data-key="${id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' });

		if (colorShiftOnHover()) {
			const overlay = el.querySelector('.color-overlay');

			if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
		}
	}

	onMount(() => {
		$.set(columns, computeColumns(), true);

		const queries = [
			'(min-width:1500px)',
			'(min-width:1000px)',
			'(min-width:600px)',
			'(min-width:400px)'
		];

		const handler = () => $.set(columns, computeColumns(), true);

		queries.forEach((q) => matchMedia(q).addEventListener('change', handler));

		const ro = new ResizeObserver(([entry]) => $.set(width, entry.contentRect.width, true));

		if (containerRef) ro.observe(containerRef);

		return () => {
			queries.forEach((q) => matchMedia(q).removeEventListener('change', handler));
			ro.disconnect();
		};
	});

	var div = root_2();

	$.each(div, 21, () => $.get(grid), (item) => item.id, ($$anchor, item) => {
		var div_1 = root_1();
		var div_2 = $.child(div_1);
		var node = $.child(div_2);

		{
			var consequent = ($$anchor) => {
				var div_3 = root();

				$.append($$anchor, div_3);
			};

			$.if(node, ($$render) => {
				if (colorShiftOnHover()) $$render(consequent);
			});
		}

		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_attribute(div_1, 'data-key', $.get(item).id);
			$.set_style(div_2, `background-image:url(${$.get(item).img ?? ''});`);
		});

		$.delegated('click', div_1, () => window.open($.get(item).url, '_blank', 'noopener'));
		$.event('mouseenter', div_1, (e) => handleEnter($.get(item).id, e.currentTarget));
		$.event('mouseleave', div_1, (e) => handleLeave($.get(item).id, e.currentTarget));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);