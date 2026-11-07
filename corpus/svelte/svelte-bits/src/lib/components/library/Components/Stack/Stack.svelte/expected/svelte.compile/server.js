import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { motionValue, animate } from 'motion';

export default function Stack($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			randomRotation = false,
			sensitivity = 200,
			sendToBackOnClick = false,
			cardsData,
			cardDimensions = { width: 208, height: 208 },
			animationConfig = { stiffness: 260, damping: 20 },
			autoplay = false,
			autoplayDelay = 3000,
			pauseOnHover = false,
			mobileClickOnly = false,
			mobileBreakpoint = 768
		} = $$props;

		const DEFAULT_CARDS = [
			{
				id: 1,
				image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format',
				alt: 'card-1'
			},

			{
				id: 2,
				image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format',
				alt: 'card-2'
			},

			{
				id: 3,
				image: 'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format',
				alt: 'card-3'
			},

			{
				id: 4,
				image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format',
				alt: 'card-4'
			}
		];

		let stack = cardsData?.length ? cardsData.slice() : DEFAULT_CARDS.slice();
		let isMobile = false;
		let isPaused = false;
		const shouldDisableDrag = $.derived(() => mobileClickOnly && isMobile);
		const shouldEnableClick = $.derived(() => sendToBackOnClick || shouldDisableDrag());

		// Per-card motion values (indexed by card id)
		const mvMap = new Map();

		let positions = {};

		function getMV(id) {
			let m = mvMap.get(id);

			if (!m) {
				const x = motionValue(0);
				const y = motionValue(0);

				m = { x, y, xv: 0, yv: 0 };

				x.on('change', (v) => {
					m.xv = v;
					positions = { ...positions, [id]: { x: v, y: m.yv } };
				});

				y.on('change', (v) => {
					m.yv = v;
					positions = { ...positions, [id]: { x: m.xv, y: v } };
				});

				mvMap.set(id, m);
				positions[id] = { x: 0, y: 0 };
			}

			return m;
		}

		const randomRot = new Map();

		function rotFor(id) {
			if (!randomRotation) return 0;
			if (!randomRot.has(id)) randomRot.set(id, Math.random() * 10 - 5);

			return randomRot.get(id);
		}

		function sendToBack(id) {
			const idx = stack.findIndex((c) => c.id === id);

			if (idx < 0) return;

			const next = [...stack];
			const [card] = next.splice(idx, 1);

			next.unshift(card);
			stack = next;

			const m = getMV(id);

			animate(m.x, 0, {
				type: 'spring',
				stiffness: animationConfig.stiffness,
				damping: animationConfig.damping
			});

			animate(m.y, 0, {
				type: 'spring',
				stiffness: animationConfig.stiffness,
				damping: animationConfig.damping
			});
		}

		// Drag
		let dragId = null;

		let dragStartX = 0;
		let dragStartY = 0;

		function endDrag(commit) {
			if (dragId == null) return;

			const id = dragId;
			const m = getMV(id);
			const dx = m.xv;
			const dy = m.yv;

			dragId = null;
			window.removeEventListener('pointermove', onWindowPointerMove);
			window.removeEventListener('pointerup', onWindowPointerUp);
			window.removeEventListener('pointercancel', onWindowPointerUp);

			if (commit && (Math.abs(dx) > sensitivity || Math.abs(dy) > sensitivity)) {
				sendToBack(id);
			} else {
				animate(m.x, 0, { type: 'spring', stiffness: 400, damping: 30 });
				animate(m.y, 0, { type: 'spring', stiffness: 400, damping: 30 });
			}
		}

		function onWindowPointerMove(e) {
			if (dragId == null) return;

			const m = getMV(dragId);

			// dragElastic 0.6
			m.x.set((e.clientX - dragStartX) * 0.6);

			m.y.set((e.clientY - dragStartY) * 0.6);
		}

		function onWindowPointerUp() {
			endDrag(true);
		}

		function onPointerDown(e, id) {
			if (shouldDisableDrag()) return;

			// If a previous drag never cleaned up, end it first.
			if (dragId != null) endDrag(false);

			dragId = id;
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			window.addEventListener('pointermove', onWindowPointerMove);
			window.addEventListener('pointerup', onWindowPointerUp);
			window.addEventListener('pointercancel', onWindowPointerUp);
		}

		function transformFor(id) {
			const p = positions[id] ?? { x: 0, y: 0 };

			// useTransform(y,[-100,100],[60,-60]) -> linear, clamped at endpoints
			const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

			const rotateX = clamp(-p.y * 0.6, -60, 60);
			const rotateY = clamp(p.x * 0.6, -60, 60);

			return { rotateX, rotateY, ...p };
		}

		onMount(() => {
			const check = () => isMobile = window.innerWidth < mobileBreakpoint;

			check();
			window.addEventListener('resize', check);

			let interval = null;

			const tick = () => {
				if (autoplay && stack.length > 1 && !isPaused) {
					const top = stack[stack.length - 1];

					if (top) sendToBack(top.id);
				}
			};

			if (autoplay) interval = setInterval(tick, autoplayDelay);

			return () => {
				window.removeEventListener('resize', check);

				if (interval) clearInterval(interval);
			};
		});

		$$renderer.push(`<div class="relative"${$.attr_style(`perspective:600px;width:${$.stringify(cardDimensions.width)}px;height:${$.stringify(cardDimensions.height)}px;`)} role="presentation"><!--[-->`);

		const each_array = $.ensure_array_like(stack);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let card = each_array[index];
			const t = transformFor(card.id);
			const rotZ = (stack.length - index - 1) * 4 + rotFor(card.id);
			const sc = 1 + index * 0.06 - stack.length * 0.06;

			$$renderer.push(`<div${$.attr_class(`absolute inset-0 ${shouldDisableDrag() ? 'cursor-pointer' : 'cursor-grab'}`)}${$.attr_style(`transform: translate(${$.stringify(t.x)}px, ${$.stringify(t.y)}px) rotateX(${$.stringify(t.rotateX)}deg) rotateY(${$.stringify(t.rotateY)}deg);`)}><div class="rounded-2xl overflow-hidden w-full h-full transition-transform"${$.attr_style(`transform: rotate(${$.stringify(rotZ)}deg) scale(${$.stringify(sc)}); transform-origin:90% 90%; transition: transform ${$.stringify(1000 / animationConfig.stiffness * 10)}ms cubic-bezier(0.25, 0.1, 0.25, 1);`)} role="presentation">`);

			if (card.image) {
				$$renderer.push(`<!--[0--><img${$.attr('src', card.image)}${$.attr('alt', card.alt ?? '')} class="w-full h-full object-cover pointer-events-none"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}