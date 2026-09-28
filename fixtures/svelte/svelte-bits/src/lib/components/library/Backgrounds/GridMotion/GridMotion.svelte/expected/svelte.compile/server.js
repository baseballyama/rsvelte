import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function GridMotion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items = [], gradientColor = 'black' } = $$props;
		const totalItems = 28;
		const defaults = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
		const combinedItems = $.derived(() => items.length > 0 ? items.slice(0, totalItems) : defaults);
		let rowEls = [null, null, null, null];
		let mouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;

		onMount(() => {
			gsap.ticker.lagSmoothing(0);

			const handleMouseMove = (e) => {
				mouseX = e.clientX;
			};

			const updateMotion = () => {
				const maxMoveAmount = 300;
				const baseDuration = 0.8;
				const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

				rowEls.forEach((row, index) => {
					if (row) {
						const direction = index % 2 === 0 ? 1 : -1;
						const moveAmount = (mouseX / window.innerWidth * maxMoveAmount - maxMoveAmount / 2) * direction;

						gsap.to(row, {
							x: moveAmount,
							duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
							ease: 'power3.out',
							overwrite: 'auto'
						});
					}
				});
			};

			const remove = gsap.ticker.add(updateMotion);

			window.addEventListener('mousemove', handleMouseMove);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				remove();
			};
		});

		$$renderer.push(`<div class="h-full w-full overflow-hidden"><section class="relative flex h-screen w-full items-center justify-center overflow-hidden"${$.attr_style(`background: radial-gradient(circle, ${$.stringify(gradientColor)} 0%, transparent 100%)`)}><div class="pointer-events-none absolute inset-0 z-[4]" style="background-size: 250px"></div> <div class="relative z-[2] grid h-[150vh] w-[150vw] flex-none origin-center -rotate-[15deg] grid-cols-1 grid-rows-4 gap-4"><!--[-->`);

		const each_array = $.ensure_array_like([0, 1, 2, 3]);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let rowIndex = each_array[$$index_1];

			$$renderer.push(`<div class="grid grid-cols-7 gap-4" style="will-change: transform, filter"><!--[-->`);

			const each_array_1 = $.ensure_array_like(Array.from({ length: 7 }, (_, i) => i));

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let itemIndex = each_array_1[$$index];
				const content = combinedItems()[rowIndex * 7 + itemIndex];

				$$renderer.push(`<div class="relative"><div class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#111] text-[1.5rem] text-white">`);

				if (typeof content === 'string' && content.startsWith('http')) {
					$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 h-full w-full bg-cover bg-center"${$.attr_style(`background-image: url(${$.stringify(content)})`)}></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="z-[1] p-4 text-center">${$.escape(content)}</div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></section></div>`);
	});
}