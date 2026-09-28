import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';
import { gsap } from 'gsap';

export default function Masonry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			ease = 'power3.out',
			duration = 0.6,
			stagger = 0.05,
			animateFrom = 'bottom',
			scaleOnHover = true,
			hoverScale = 0.95,
			blurToFocus = true,
			colorShiftOnHover = false
		} = $$props;

		let containerRef;
		let width = 0;
		let columns = 1;
		let imagesReady = false;
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
			if (!width) return [];

			const colHeights = new Array(columns).fill(0);
			const gap = 16;
			const totalGaps = (columns - 1) * gap;
			const columnWidth = (width - totalGaps) / columns;

			return items.map((child) => {
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

			let direction = animateFrom;

			if (animateFrom === 'random') {
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

		function handleEnter(id, el) {
			if (scaleOnHover) gsap.to(`[data-key="${id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });

			if (colorShiftOnHover) {
				const overlay = el.querySelector('.color-overlay');

				if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
			}
		}

		function handleLeave(id, el) {
			if (scaleOnHover) gsap.to(`[data-key="${id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' });

			if (colorShiftOnHover) {
				const overlay = el.querySelector('.color-overlay');

				if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
			}
		}

		onMount(() => {
			columns = computeColumns();

			const queries = [
				'(min-width:1500px)',
				'(min-width:1000px)',
				'(min-width:600px)',
				'(min-width:400px)'
			];

			const handler = () => columns = computeColumns();

			queries.forEach((q) => matchMedia(q).addEventListener('change', handler));

			const ro = new ResizeObserver(([entry]) => width = entry.contentRect.width);

			if (containerRef) ro.observe(containerRef);

			return () => {
				queries.forEach((q) => matchMedia(q).removeEventListener('change', handler));
				ro.disconnect();
			};
		});

		$$renderer.push(`<div class="relative w-full h-full"><!--[-->`);

		const each_array = $.ensure_array_like(grid());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div${$.attr('data-key', item.id)} class="absolute box-content" style="will-change:transform,width,height,opacity;" role="presentation"><div class="relative w-full h-full bg-cover bg-center rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] uppercase text-[10px] leading-[10px]"${$.attr_style(`background-image:url(${$.stringify(item.img)});`)}>`);

			if (colorShiftOnHover) {
				$$renderer.push(`<!--[0--><div class="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}