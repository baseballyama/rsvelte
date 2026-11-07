import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';

export default function BlobCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			blobType = 'circle',
			fillColor = '#FF8A4C',
			trailCount = 3,
			sizes = [60, 125, 75],
			innerSizes = [20, 35, 25],
			innerColor = 'rgba(255,255,255,0.8)',
			opacities = [0.6, 0.6, 0.6],
			shadowColor = 'rgba(0,0,0,0.75)',
			shadowBlur = 5,
			shadowOffsetX = 10,
			shadowOffsetY = 10,
			filterId = 'blob',
			filterStdDeviation = 30,
			filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
			useFilter = true,
			fastDuration = 0.1,
			slowDuration = 0.5,
			fastEase = 'power3.out',
			slowEase = 'power1.out',
			zIndex = 100
		} = $$props;

		let container;
		const blobs = Array(trailCount).fill(null);

		function move(e) {
			if (!container) return;

			const rect = container.getBoundingClientRect();
			const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
			const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;

			blobs.forEach((el, i) => {
				if (!el) return;

				const isLead = i === 0;

				gsap.to(el, {
					x: x - rect.left,
					y: y - rect.top,
					duration: isLead ? fastDuration : slowDuration,
					ease: isLead ? fastEase : slowEase
				});
			});
		}

		$$renderer.push(`<div role="presentation" class="absolute inset-0"${$.attr_style(`z-index:${$.stringify(zIndex)};`)}>`);

		if (useFilter) {
			$$renderer.push(`<!--[0--><svg class="absolute w-0 h-0" aria-hidden="true"><filter${$.attr('id', filterId)}><feGaussianBlur in="SourceGraphic" result="blur"${$.attr('stdDeviation', filterStdDeviation)}></feGaussianBlur><feColorMatrix in="blur"${$.attr('values', filterColorMatrixValues)}></feColorMatrix></filter></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="pointer-events-none absolute inset-0 overflow-hidden select-none cursor-default"${$.attr_style(useFilter ? `filter:url(#${filterId});` : '')}><!--[-->`);

		const each_array = $.ensure_array_like(Array(trailCount));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<div class="absolute will-change-transform transform -translate-x-1/2 -translate-y-1/2"${$.attr_style(`width:${$.stringify(sizes[i])}px;height:${$.stringify(sizes[i])}px;border-radius:${blobType === 'circle' ? '50%' : '0'};background-color:${$.stringify(fillColor)};opacity:${$.stringify(opacities[i])};box-shadow:${$.stringify(shadowOffsetX)}px ${$.stringify(shadowOffsetY)}px ${$.stringify(shadowBlur)}px 0 ${$.stringify(shadowColor)};`)}><div class="absolute"${$.attr_style(`width:${$.stringify(innerSizes[i])}px;height:${$.stringify(innerSizes[i])}px;top:${$.stringify((sizes[i] - innerSizes[i]) / 2)}px;left:${$.stringify((sizes[i] - innerSizes[i]) / 2)}px;background-color:${$.stringify(innerColor)};border-radius:${blobType === 'circle' ? '50%' : '0'};`)}></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}