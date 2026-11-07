import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<div role="button" tabindex="0"><!></div>`);
var root_1 = $.from_html(`<div class="absolute bottom-0 right-0 origin-bottom-right overflow-visible"></div>`);

export default function CardSwap($$anchor, $$props) {
	$.push($$props, true);

	let width = $.prop($$props, 'width', 3, 500),
		height = $.prop($$props, 'height', 3, 400),
		cardDistance = $.prop($$props, 'cardDistance', 3, 60),
		verticalDistance = $.prop($$props, 'verticalDistance', 3, 70),
		delay = $.prop($$props, 'delay', 3, 5000),
		pauseOnHover = $.prop($$props, 'pauseOnHover', 3, false),
		skewAmount = $.prop($$props, 'skewAmount', 3, 6),
		easing = $.prop($$props, 'easing', 3, 'elastic');

	const config = $.derived(() => easing() === 'elastic'
		? {
			ease: 'elastic.out(0.6,0.9)',
			durDrop: 2,
			durMove: 2,
			durReturn: 2,
			promoteOverlap: 0.9,
			returnDelay: 0.05
		}
		: {
			ease: 'power1.inOut',
			durDrop: 0.8,
			durMove: 0.8,
			durReturn: 0.8,
			promoteOverlap: 0.45,
			returnDelay: 0.2
		});

	const cardEls = [];
	let containerRef;

	function makeSlot(i, distX, distY, total) {
		return {
			x: i * distX,
			y: -i * distY,
			z: -i * distX * 1.5,
			zIndex: total - i
		};
	}

	function placeNow(el, slot, skew) {
		gsap.set(el, {
			x: slot.x,
			y: slot.y,
			z: slot.z,
			xPercent: -50,
			yPercent: -50,
			skewY: skew,
			transformOrigin: 'center center',
			zIndex: slot.zIndex,
			force3D: true
		});
	}

	const wStyle = $.derived(() => typeof width() === 'number' ? `${width()}px` : width());
	const hStyle = $.derived(() => typeof height() === 'number' ? `${height()}px` : height());

	onMount(() => {
		const total = $$props.cards.length;
		const order = Array.from({ length: total }, (_, i) => i);
		let tlRef = null;
		let intervalId = 0;

		cardEls.forEach((el, i) => placeNow(el, makeSlot(i, cardDistance(), verticalDistance(), total), skewAmount()));

		function swap() {
			if (order.length < 2) return;

			const front = order[0];
			const rest = order.slice(1);
			const elFront = cardEls[front];
			const tl = gsap.timeline();

			tlRef = tl;

			tl.to(elFront, {
				y: '+=500',
				duration: $.get(config).durDrop,
				ease: $.get(config).ease
			});

			tl.addLabel('promote', `-=${$.get(config).durDrop * $.get(config).promoteOverlap}`);

			rest.forEach((idx, i) => {
				const el = cardEls[idx];
				const slot = makeSlot(i, cardDistance(), verticalDistance(), total);

				tl.set(el, { zIndex: slot.zIndex }, 'promote');

				tl.to(
					el,
					{
						x: slot.x,
						y: slot.y,
						z: slot.z,
						duration: $.get(config).durMove,
						ease: $.get(config).ease
					},
					`promote+=${i * 0.15}`
				);
			});

			const backSlot = makeSlot(total - 1, cardDistance(), verticalDistance(), total);

			tl.addLabel('return', `promote+=${$.get(config).durMove * $.get(config).returnDelay}`);
			tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');

			tl.to(
				elFront,
				{
					x: backSlot.x,
					y: backSlot.y,
					z: backSlot.z,
					duration: $.get(config).durReturn,
					ease: $.get(config).ease
				},
				'return'
			);

			tl.call(() => {
				order.splice(0, order.length, ...rest, front);
			});
		}

		swap();
		intervalId = window.setInterval(swap, delay());

		const node = containerRef;

		const pause = () => {
			tlRef?.pause();
			clearInterval(intervalId);
		};

		const resume = () => {
			tlRef?.play();
			intervalId = window.setInterval(swap, delay());
		};

		if (pauseOnHover() && node) {
			node.addEventListener('mouseenter', pause);
			node.addEventListener('mouseleave', resume);
		}

		return () => {
			clearInterval(intervalId);

			if (pauseOnHover() && node) {
				node.removeEventListener('mouseenter', pause);
				node.removeEventListener('mouseleave', resume);
			}
		};
	});

	var div = root_1();

	$.each(div, 21, () => $$props.cards, $.index, ($$anchor, card, i) => {
		var div_1 = root();
		var node_1 = $.child(div_1);

		$.snippet(node_1, () => $.get(card).content);
		$.reset(div_1);
		$.bind_this(div_1, ($$value, i) => cardEls[i] = $$value, (i) => cardEls?.[i], () => [i]);

		$.template_effect(() => {
			$.set_class(div_1, 1, `absolute top-1/2 left-1/2 rounded-xl border border-white bg-black [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${$.get(card).class ?? '' ?? ''}`);
			$.set_style(div_1, `width:${$.get(wStyle) ?? ''};height:${$.get(hStyle) ?? ''};${$.get(card).style ?? '' ?? ''}`);
		});

		$.delegated('click', div_1, () => $$props.onCardClick?.(i));

		$.delegated('keydown', div_1, (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				$$props.onCardClick?.(i);
			}
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.template_effect(() => $.set_style(div, `width:${$.get(wStyle) ?? ''};height:${$.get(hStyle) ?? ''};transform:translate(5%,20%);perspective:900px;`));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);