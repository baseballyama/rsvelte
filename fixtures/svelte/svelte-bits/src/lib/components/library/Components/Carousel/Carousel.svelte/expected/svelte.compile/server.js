import * as $ from 'svelte/internal/server';
import { onMount, untrack } from 'svelte';
import { motionValue, animate, transform } from 'motion';

export default function Carousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let {
			items = DEFAULT_ITEMS,
			baseWidth = 300,
			autoplay = false,
			autoplayDelay = 3000,
			pauseOnHover = false,
			loop = false,
			round = false
		} = $$props;

		const containerPadding = 16;
		const GAP = 16;
		const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };
		const DRAG_BUFFER = 0;
		const VELOCITY_THRESHOLD = 500;
		const itemWidth = $.derived(() => baseWidth - containerPadding * 2);
		const trackItemOffset = $.derived(() => itemWidth() + GAP);

		const itemsForRender = $.derived(() => !loop
			? items
			: items.length === 0 ? [] : [items[items.length - 1], ...items, items[0]]);

		let position = loop ? 1 : 0;
		let isHovered = false;
		let isJumping = false;
		let isAnimating = false;
		const x = motionValue(0);
		let xValue = 0;

		x.on('change', (v) => xValue = v);

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

			isAnimating = true;

			currentAnim = animate(x, target, {
				...SPRING_OPTIONS,
				onComplete: () => handleAnimationComplete()
			});
		}

		function handleAnimationComplete() {
			if (!loop || itemsForRender().length <= 1) {
				isAnimating = false;

				return;
			}

			const lastCloneIndex = itemsForRender().length - 1;

			if (position === lastCloneIndex) {
				isJumping = true;

				const target = 1;

				position = target;
				x.set(-target * trackItemOffset());

				requestAnimationFrame(() => {
					isJumping = false;
					isAnimating = false;
				});

				return;
			}

			if (position === 0) {
				isJumping = true;

				const target = items.length;

				position = target;
				x.set(-target * trackItemOffset());

				requestAnimationFrame(() => {
					isJumping = false;
					isAnimating = false;
				});

				return;
			}

			isAnimating = false;
		}

		onMount(() => {
			if (pauseOnHover && containerRef) {
				const enter = () => isHovered = true;
				const leave = () => isHovered = false;

				containerRef.addEventListener('mouseenter', enter);
				containerRef.addEventListener('mouseleave', leave);

				return () => {
					containerRef.removeEventListener('mouseenter', enter);
					containerRef.removeEventListener('mouseleave', leave);
				};
			}
		});

		// Custom drag
		let dragStartX = 0;

		let dragStartT = 0;
		let dragging = false;
		let dragOffset = 0;

		function onPointerDown(e) {
			if (isAnimating) return;

			dragging = true;
			dragStartX = e.clientX;
			dragStartT = performance.now();
			dragOffset = 0;
			currentAnim?.stop?.();
			e.currentTarget.setPointerCapture(e.pointerId);
		}

		function onPointerMove(e) {
			if (!dragging) return;

			dragOffset = e.clientX - dragStartX;
			x.set(-position * trackItemOffset() + dragOffset);
		}

		function onPointerUp(e) {
			if (!dragging) return;

			dragging = false;

			const dt = Math.max(1, performance.now() - dragStartT);
			const velocity = dragOffset / dt * 1000;

			const direction = dragOffset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD
				? 1
				: dragOffset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD ? -1 : 0;

			e.currentTarget.releasePointerCapture(e.pointerId);

			if (direction === 0) {
				animateTo(-position * trackItemOffset());

				return;
			}

			const next = position + direction;
			const max = itemsForRender().length - 1;

			position = Math.max(0, Math.min(next, max));
		}

		const activeIndex = $.derived(() => items.length === 0
			? 0
			: loop
				? (position - 1 + items.length) % items.length
				: Math.min(position, items.length - 1));

		function rotateForIndex(index) {
			const range = [
				-(index + 1) * trackItemOffset(),
				-index * trackItemOffset(),
				-(index - 1) * trackItemOffset()
			];

			return transform(range, [90, 0, -90], { clamp: false })(xValue);
		}

		$$renderer.push(`<div${$.attr_class(`relative overflow-hidden p-4 ${round
			? 'rounded-full border border-white'
			: 'rounded-[24px] border border-[#222]'}`)}${$.attr_style(`width:${$.stringify(baseWidth)}px; ${round ? `height:${baseWidth}px;` : ''}`)}><div class="flex"${$.attr_style(`width:${$.stringify(itemWidth())}px; gap:16px; perspective:1000px; perspective-origin:${$.stringify(position * trackItemOffset() + itemWidth() / 2)}px 50%; transform:translate3d(${$.stringify(xValue)}px, 0, 0); cursor:${dragging ? 'grabbing' : 'grab'};`)}><!--[-->`);

		const each_array = $.ensure_array_like(itemsForRender());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<div${$.attr_class(`relative shrink-0 flex flex-col ${round
				? 'items-center justify-center text-center bg-[#120F17] border-0'
				: 'items-start justify-between bg-[#222] border border-[#222] rounded-[12px]'} overflow-hidden`)}${$.attr_style(`width:${$.stringify(itemWidth())}px; height:${round ? `${itemWidth()}px` : '100%'}; transform: rotateY(${$.stringify(rotateForIndex(index).toFixed(3))}deg); ${round ? 'border-radius:50%;' : ''}`)}><div${$.attr_class($.clsx(round ? 'p-0 m-0' : 'mb-4 p-5'))}><span class="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#120F17]">`);

			if (item.icon) {
				$$renderer.push('<!--[0-->');
				item.icon($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><span class="block h-2 w-2 rounded-full bg-white"></span>`);
			}

			$$renderer.push(`<!--]--></span></div> <div class="p-5"><div class="mb-1 font-black text-lg text-white">${$.escape(item.title)}</div> <p class="text-sm text-white">${$.escape(item.description)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div${$.attr_class(`flex w-full justify-center ${round
			? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2'
			: ''}`)}><div class="mt-4 flex w-[150px] justify-between px-8"><!--[-->`);

		const each_array_1 = $.ensure_array_like(items);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let _ = each_array_1[index];

			$$renderer.push(`<button type="button"${$.attr_class(`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${activeIndex() === index
				? round ? 'bg-white' : 'bg-[#333333]'
				: round ? 'bg-[#555]' : 'bg-[rgba(51,51,51,0.4)]'}`)}${$.attr_style(`transform:scale(${$.stringify(activeIndex() === index ? 1.2 : 1)}); transition: transform 0.15s, background-color 0.15s; border:0;`)}${$.attr('aria-label', `Go to slide ${$.stringify(index + 1)}`)}></button>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}