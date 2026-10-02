import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function FlowingMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			speed = 15,
			textColor = '#fff',
			bgColor = '#14110E',
			marqueeBgColor = '#fff',
			marqueeTextColor = '#14110E',
			borderColor = '#fff'
		} = $$props;

		const itemRefs = [];
		const marqueeRefs = [];
		const marqueeInnerRefs = [];
		const animationRefs = [];
		let repetitions = [];
		const animationDefaults = { duration: 0.6, ease: 'expo' };

		function findClosestEdge(mx, my, w, h) {
			const top = Math.pow(mx - w / 2, 2) + Math.pow(my, 2);
			const bot = Math.pow(mx - w / 2, 2) + Math.pow(my - h, 2);

			return top < bot ? 'top' : 'bottom';
		}

		onMount(() => {
			const calc = () => {
				repetitions = items.map((_, i) => {
					const inner = marqueeInnerRefs[i];

					if (!inner) return 4;

					const part = inner.querySelector('.marquee-part');

					if (!part) return 4;

					const cw = part.offsetWidth || 1;
					const needed = Math.ceil(window.innerWidth / cw) + 2;

					return Math.max(4, needed);
				});
			};

			calc();

			const onResize = () => calc();

			window.addEventListener('resize', onResize);

			const timer = setTimeout(
				() => {
					items.forEach((_, i) => {
						const inner = marqueeInnerRefs[i];

						if (!inner) return;

						const part = inner.querySelector('.marquee-part');

						if (!part) return;

						const cw = part.offsetWidth;

						if (!cw) return;

						animationRefs[i]?.kill();
						animationRefs[i] = gsap.to(inner, { x: -cw, duration: speed, ease: 'none', repeat: -1 });
					});
				},
				50
			);

			return () => {
				clearTimeout(timer);
				animationRefs.forEach((t) => t?.kill());
				window.removeEventListener('resize', onResize);
			};
		});

		function onEnter(ev, i) {
			const root = itemRefs[i];
			const m = marqueeRefs[i];
			const mi = marqueeInnerRefs[i];

			if (!root || !m || !mi) return;

			const r = root.getBoundingClientRect();
			const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);

			gsap.timeline({ defaults: animationDefaults }).set(m, { y: edge === 'top' ? '-101%' : '101%' }, 0).set(mi, { y: edge === 'top' ? '101%' : '-101%' }, 0).to([m, mi], { y: '0%' }, 0);
		}

		function onLeave(ev, i) {
			const root = itemRefs[i];
			const m = marqueeRefs[i];
			const mi = marqueeInnerRefs[i];

			if (!root || !m || !mi) return;

			const r = root.getBoundingClientRect();
			const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);

			gsap.timeline({ defaults: animationDefaults }).to(m, { y: edge === 'top' ? '-101%' : '101%' }, 0).to(mi, { y: edge === 'top' ? '101%' : '-101%' }, 0);
		}

		$$renderer.push(`<div class="w-full h-full overflow-hidden"${$.attr_style(`background-color:${$.stringify(bgColor)};`)}><nav class="flex flex-col h-full m-0 p-0"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<div class="flex-1 relative overflow-hidden text-center"${$.attr_style(`border-top:${i === 0 ? 'none' : `1px solid ${borderColor}`};`)}><a class="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[4vh]"${$.attr('href', item.link)}${$.attr_style(`color:${$.stringify(textColor)};`)}>${$.escape(item.text)}</a> <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"${$.attr_style(`background-color:${$.stringify(marqueeBgColor)};`)}><div class="h-full w-fit flex"><!--[-->`);

			const each_array_1 = $.ensure_array_like(Array.from({ length: repetitions[i] ?? 4 }));

			for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
				let _ = each_array_1[idx];

				$$renderer.push(`<div class="marquee-part flex items-center flex-shrink-0"${$.attr_style(`color:${$.stringify(marqueeTextColor)};`)}><span class="whitespace-nowrap uppercase font-normal text-[4vh] leading-[1] px-[1vw]">${$.escape(item.text)}</span> <div class="w-[200px] h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center"${$.attr_style(`background-image:url(${$.stringify(item.image)});`)}></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		}

		$$renderer.push(`<!--]--></nav></div>`);
	});
}