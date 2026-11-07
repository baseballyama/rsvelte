import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { motionValue, animate } from 'motion';

export default function ElasticSlider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			defaultValue = 50,
			startingValue = 0,
			maxValue = 100,
			class: className = '',
			isStepped = false,
			stepSize = 1,
			leftIcon,
			rightIcon
		} = $$props;

		const MAX_OVERFLOW = 50;
		let value = defaultValue;
		let region = 'middle';
		let sliderRef;
		let trackWrapperEl;
		let leftIconEl;
		let rightIconEl;
		let leftIconInner;
		let rightIconInner;
		let outerEl;
		const clientX = motionValue(0);
		const overflow = motionValue(0);
		const scale = motionValue(1);

		function decay(v, max) {
			if (max === 0) return 0;

			const entry = v / max;
			const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

			return sigmoid * max;
		}

		function applyTransforms() {
			if (!sliderRef || !trackWrapperEl || !outerEl) return;

			const o = overflow.get();
			const s = scale.get();
			const cx = clientX.get();
			const { left, width } = sliderRef.getBoundingClientRect();
			const opacity = 0.7 + (s - 1) / 0.2 * 0.3;

			outerEl.style.transform = `scale(${s})`;
			outerEl.style.opacity = String(opacity);

			const sx = 1 + o / Math.max(width, 1);
			const sy = 1 + Math.min(o, MAX_OVERFLOW) / MAX_OVERFLOW * (0.8 - 1);
			const origin = cx < left + width / 2 ? 'right' : 'left';
			const height = 6 + (s - 1) / 0.2 * 6;
			const margin = (s - 1) / 0.2 * -3;

			trackWrapperEl.style.transform = `scaleX(${sx}) scaleY(${sy})`;
			trackWrapperEl.style.transformOrigin = origin;
			trackWrapperEl.style.height = `${height}px`;
			trackWrapperEl.style.marginTop = `${margin}px`;
			trackWrapperEl.style.marginBottom = `${margin}px`;

			const leftX = region === 'left' ? -o / Math.max(s, 0.0001) : 0;
			const rightX = region === 'right' ? o / Math.max(s, 0.0001) : 0;

			if (leftIconEl) leftIconEl.style.transform = `translateX(${leftX}px)`;
			if (rightIconEl) rightIconEl.style.transform = `translateX(${rightX}px)`;
		}

		function pulseIcon(el) {
			el.animate(
				[
					{ transform: 'scale(1)' },
					{ transform: 'scale(1.4)' },
					{ transform: 'scale(1)' }
				],
				{ duration: 250, easing: 'ease-out' }
			);
		}

		onMount(() => {
			const unsubs = [
				overflow.on('change', applyTransforms),
				scale.on('change', applyTransforms),
				clientX.on('change', (latest) => {
					if (!sliderRef) return;

					const { left, right } = sliderRef.getBoundingClientRect();
					let newOverflow;

					if (latest < left) {
						if (region !== 'left' && leftIconInner) pulseIcon(leftIconInner);

						region = 'left';
						newOverflow = left - latest;
					} else if (latest > right) {
						if (region !== 'right' && rightIconInner) pulseIcon(rightIconInner);

						region = 'right';
						newOverflow = latest - right;
					} else {
						region = 'middle';
						newOverflow = 0;
					}

					overflow.jump(decay(newOverflow, MAX_OVERFLOW));
					applyTransforms();
				})
			];

			applyTransforms();

			return () => unsubs.forEach((u) => u());
		});

		function onPointerMove(e) {
			if (e.buttons > 0 && sliderRef) {
				const { left, width } = sliderRef.getBoundingClientRect();
				let newValue = startingValue + (e.clientX - left) / width * (maxValue - startingValue);

				if (isStepped) newValue = Math.round(newValue / stepSize) * stepSize;

				newValue = Math.min(Math.max(newValue, startingValue), maxValue);
				value = newValue;
				clientX.jump(e.clientX);
			}
		}

		function onPointerDown(e) {
			onPointerMove(e);
			e.currentTarget.setPointerCapture(e.pointerId);
		}

		function onPointerUp() {
			animate(overflow, 0, { type: 'spring', bounce: 0.5 });
		}

		function onEnter() {
			animate(scale, 1.2);
		}

		function onLeave() {
			animate(scale, 1);
		}

		const rangePercentage = $.derived(() => (value - startingValue) / Math.max(1e-6, maxValue - startingValue) * 100);

		$$renderer.push(`<div${$.attr_class(`slider-container ${$.stringify(className)}`, 'svelte-q3pu1o')}><div class="slider-wrapper svelte-q3pu1o" role="presentation"><div class="slider-icon svelte-q3pu1o"><div class="slider-icon-inner svelte-q3pu1o">`);

		if (leftIcon) {
			$$renderer.push('<!--[0-->');
			leftIcon($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12z"></path></svg>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="slider-root svelte-q3pu1o" role="slider"${$.attr('aria-valuemin', startingValue)}${$.attr('aria-valuemax', maxValue)}${$.attr('aria-valuenow', value)} tabindex="0"><div class="slider-track-wrapper svelte-q3pu1o"><div class="slider-track svelte-q3pu1o"><div class="slider-range svelte-q3pu1o"${$.attr_style(`width:${$.stringify(rangePercentage())}%;`)}></div></div></div></div> <div class="slider-icon svelte-q3pu1o"><div class="slider-icon-inner svelte-q3pu1o">`);

		if (rightIcon) {
			$$renderer.push('<!--[0-->');
			rightIcon($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05a4.5 4.5 0 0 0 2.5-4.02zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"></path></svg>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <p class="value-indicator svelte-q3pu1o">${$.escape(Math.round(value))}</p></div>`);
	});
}