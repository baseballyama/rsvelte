import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';

export default function PixelTransition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			firstContent,
			secondContent,
			gridSize = 7,
			pixelColor = 'currentColor',
			animationStepDuration = 0.3,
			once = false,
			aspectRatio = '100%',
			class: className = '',
			style = ''
		} = $$props;

		let pixelGrid;
		let activeEl;
		let isActive = false;
		let delayedCall = null;
		const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia('(pointer: coarse)').matches);

		function animate(activate) {
			isActive = activate;

			if (!pixelGrid || !activeEl) return;

			const pixels = pixelGrid.querySelectorAll('.pixelated-image-card__pixel');

			if (!pixels.length) return;

			gsap.killTweensOf(pixels);
			delayedCall?.kill();
			gsap.set(pixels, { display: 'none' });

			const stagger = animationStepDuration / pixels.length;

			gsap.to(pixels, {
				display: 'block',
				duration: 0,
				stagger: { each: stagger, from: 'random' }
			});

			delayedCall = gsap.delayedCall(animationStepDuration, () => {
				activeEl.style.display = activate ? 'block' : 'none';
				activeEl.style.pointerEvents = activate ? 'none' : '';
			});

			gsap.to(pixels, {
				display: 'none',
				duration: 0,
				delay: animationStepDuration,
				stagger: { each: stagger, from: 'random' }
			});
		}

		const handleEnter = () => {
			if (!isActive) animate(true);
		};

		const handleLeave = () => {
			if (isActive && !once) animate(false);
		};

		const handleClick = () => {
			if (!isActive) animate(true); else if (isActive && !once) animate(false);
		};

		$$renderer.push(`<div${$.attr_class(`bg-[#222] text-white rounded-[15px] border-2 border-white w-[300px] max-w-full relative overflow-hidden ${$.stringify(className)}`)}${$.attr_style(style)} tabindex="0" role="button"><div${$.attr_style(`padding-top:${$.stringify(aspectRatio)};`)}></div> <div class="absolute inset-0 w-full h-full"${$.attr('aria-hidden', isActive)}>`);
		firstContent($$renderer);
		$$renderer.push(`<!----></div> <div class="absolute inset-0 w-full h-full z-[2]" style="display:none;"${$.attr('aria-hidden', !isActive)}>`);
		secondContent($$renderer);
		$$renderer.push(`<!----></div> <div class="absolute inset-0 w-full h-full pointer-events-none z-[3]"></div></div>`);
	});
}