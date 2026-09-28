import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { motionValue, animate } from 'motion';

var root = $.from_html(`<img class="w-full h-full object-cover pointer-events-none"/>`);
var root_1 = $.from_html(`<div><div class="rounded-2xl overflow-hidden w-full h-full transition-transform" role="presentation"><!></div></div>`);
var root_2 = $.from_html(`<div class="relative" role="presentation"></div>`);

export default function Stack($$anchor, $$props) {
	$.push($$props, true);

	let randomRotation = $.prop($$props, 'randomRotation', 3, false),
		sensitivity = $.prop($$props, 'sensitivity', 3, 200),
		sendToBackOnClick = $.prop($$props, 'sendToBackOnClick', 3, false),
		cardDimensions = $.prop($$props, 'cardDimensions', 19, () => ({ width: 208, height: 208 })),
		animationConfig = $.prop($$props, 'animationConfig', 19, () => ({ stiffness: 260, damping: 20 })),
		autoplay = $.prop($$props, 'autoplay', 3, false),
		autoplayDelay = $.prop($$props, 'autoplayDelay', 3, 3000),
		pauseOnHover = $.prop($$props, 'pauseOnHover', 3, false),
		mobileClickOnly = $.prop($$props, 'mobileClickOnly', 3, false),
		mobileBreakpoint = $.prop($$props, 'mobileBreakpoint', 3, 768);

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

	let stack = $.state($.proxy($$props.cardsData?.length ? $$props.cardsData.slice() : DEFAULT_CARDS.slice()));
	let isMobile = $.state(false);
	let isPaused = $.state(false);

	$.user_effect(() => {
		if ($$props.cardsData?.length) $.set(stack, $$props.cardsData.slice(), true);
	});

	const shouldDisableDrag = $.derived(() => mobileClickOnly() && $.get(isMobile));
	const shouldEnableClick = $.derived(() => sendToBackOnClick() || $.get(shouldDisableDrag));

	// Per-card motion values (indexed by card id)
	const mvMap = new Map();

	let positions = $.state($.proxy({}));

	function getMV(id) {
		let m = mvMap.get(id);

		if (!m) {
			const x = motionValue(0);
			const y = motionValue(0);

			m = { x, y, xv: 0, yv: 0 };

			x.on('change', (v) => {
				m.xv = v;
				$.set(positions, { ...$.get(positions), [id]: { x: v, y: m.yv } }, true);
			});

			y.on('change', (v) => {
				m.yv = v;
				$.set(positions, { ...$.get(positions), [id]: { x: m.xv, y: v } }, true);
			});

			mvMap.set(id, m);
			$.get(positions)[id] = { x: 0, y: 0 };
		}

		return m;
	}

	const randomRot = new Map();

	function rotFor(id) {
		if (!randomRotation()) return 0;
		if (!randomRot.has(id)) randomRot.set(id, Math.random() * 10 - 5);

		return randomRot.get(id);
	}

	function sendToBack(id) {
		const idx = $.get(stack).findIndex((c) => c.id === id);

		if (idx < 0) return;

		const next = [...$.get(stack)];
		const [card] = next.splice(idx, 1);

		next.unshift(card);
		$.set(stack, next, true);

		const m = getMV(id);

		animate(m.x, 0, {
			type: 'spring',
			stiffness: animationConfig().stiffness,
			damping: animationConfig().damping
		});

		animate(m.y, 0, {
			type: 'spring',
			stiffness: animationConfig().stiffness,
			damping: animationConfig().damping
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

		if (commit && (Math.abs(dx) > sensitivity() || Math.abs(dy) > sensitivity())) {
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
		if ($.get(shouldDisableDrag)) return;

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
		const p = $.get(positions)[id] ?? { x: 0, y: 0 };

		// useTransform(y,[-100,100],[60,-60]) -> linear, clamped at endpoints
		const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

		const rotateX = clamp(-p.y * 0.6, -60, 60);
		const rotateY = clamp(p.x * 0.6, -60, 60);

		return { rotateX, rotateY, ...p };
	}

	onMount(() => {
		const check = () => $.set(isMobile, window.innerWidth < mobileBreakpoint());

		check();
		window.addEventListener('resize', check);

		let interval = null;

		const tick = () => {
			if (autoplay() && $.get(stack).length > 1 && !$.get(isPaused)) {
				const top = $.get(stack)[$.get(stack).length - 1];

				if (top) sendToBack(top.id);
			}
		};

		if (autoplay()) interval = setInterval(tick, autoplayDelay());

		return () => {
			window.removeEventListener('resize', check);

			if (interval) clearInterval(interval);
		};
	});

	var div = root_2();

	$.each(div, 23, () => $.get(stack), (card) => card.id, ($$anchor, card, index) => {
		const t = $.derived(() => transformFor($.get(card).id));
		const rotZ = $.derived(() => ($.get(stack).length - $.get(index) - 1) * 4 + rotFor($.get(card).id));
		const sc = $.derived(() => 1 + $.get(index) * 0.06 - $.get(stack).length * 0.06);
		var div_1 = root_1();
		var div_2 = $.child(div_1);
		var node = $.child(div_2);

		{
			var consequent = ($$anchor) => {
				var img = root();

				$.template_effect(() => {
					$.set_attribute(img, 'src', $.get(card).image);
					$.set_attribute(img, 'alt', $.get(card).alt ?? '');
				});

				$.append($$anchor, img);
			};

			$.if(node, ($$render) => {
				if ($.get(card).image) $$render(consequent);
			});
		}

		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_class(div_1, 1, `absolute inset-0 ${$.get(shouldDisableDrag) ? 'cursor-pointer' : 'cursor-grab'}`);
			$.set_style(div_1, `transform: translate(${$.get(t).x ?? ''}px, ${$.get(t).y ?? ''}px) rotateX(${$.get(t).rotateX ?? ''}deg) rotateY(${$.get(t).rotateY ?? ''}deg);`);
			$.set_style(div_2, `transform: rotate(${$.get(rotZ) ?? ''}deg) scale(${$.get(sc) ?? ''}); transform-origin:90% 90%; transition: transform ${1000 / animationConfig().stiffness * 10}ms cubic-bezier(0.25, 0.1, 0.25, 1);`);
		});

		$.delegated('pointerdown', div_1, (e) => onPointerDown(e, $.get(card).id));
		$.delegated('pointermove', div_1, onPointerMove);
		$.delegated('pointerup', div_1, (e) => onPointerUp(e, $.get(card).id));
		$.event('pointercancel', div_1, (e) => onPointerUp(e, $.get(card).id));
		$.delegated('click', div_2, () => $.get(shouldEnableClick) && sendToBack($.get(card).id));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_style(div, `perspective:600px;width:${cardDimensions().width ?? ''}px;height:${cardDimensions().height ?? ''}px;`));
	$.event('mouseenter', div, () => pauseOnHover() && $.set(isPaused, true));
	$.event('mouseleave', div, () => pauseOnHover() && $.set(isPaused, false));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['pointerdown', 'pointermove', 'pointerup', 'click']);