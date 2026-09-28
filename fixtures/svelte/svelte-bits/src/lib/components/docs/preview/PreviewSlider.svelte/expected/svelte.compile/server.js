import * as $ from 'svelte/internal/server';

export default function PreviewSlider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title = '',
			min = 0,
			max = 100,
			step = 1,
			value = 0,
			valueUnit = '',
			isDisabled = false,
			displayValue,
			onChange
		} = $$props;

		let trackEl = null;
		let isDragging = false;
		let isHovering = false;
		let isHoverDevice = false;
		const range = $.derived(() => max - min);
		const percentage = $.derived(() => range() > 0 ? (value - min) / range() * 100 : 0);
		const isActive = $.derived(() => isDragging || isHoverDevice && isHovering);
		const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

		function stepDecimals(s) {
			const str = s.toString();
			const dot = str.indexOf('.');

			return dot === -1 ? 0 : str.length - dot - 1;
		}

		function roundToStep(v, s, lo) {
			const raw = Math.round((v - lo) / s) * s + lo;
			const decimals = Math.max(stepDecimals(s), stepDecimals(lo));

			return Number(raw.toFixed(decimals));
		}

		function compute(clientX) {
			if (!trackEl) return value;

			const rect = trackEl.getBoundingClientRect();
			const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
			const raw = min + ratio * range();

			return clamp(roundToStep(raw, step, min), min, max);
		}

		function onPointerDown(e) {
			if (isDisabled) return;

			e.preventDefault();
			trackEl?.setPointerCapture(e.pointerId);
			isDragging = true;
			onChange?.(compute(e.clientX));
		}

		function onPointerMove(e) {
			if (!isDragging) return;

			onChange?.(compute(e.clientX));
		}

		function onPointerUp() {
			isDragging = false;
		}

		function onKeyDown(e) {
			if (isDisabled) return;

			let next;

			switch (e.key) {
				case 'ArrowRight':

				case 'ArrowUp':
					next = value + step;
					break;

				case 'ArrowLeft':

				case 'ArrowDown':
					next = value - step;
					break;

				case 'Home':
					next = min;
					break;

				case 'End':
					next = max;
					break;

				default:
					return;
			}

			e.preventDefault();
			onChange?.(clamp(roundToStep(next, step, min), min, max));
		}

		const ticks = 9;

		const formatted = $.derived(() => displayValue
			? displayValue(value)
			: `${Number(value.toFixed(stepDecimals(step)))}${valueUnit}`);

		$$renderer.push(`<div class="scrubber"><div class="scrubber-track" role="slider"${$.attr('aria-label', title)}${$.attr('aria-valuemin', min)}${$.attr('aria-valuemax', max)}${$.attr('aria-valuenow', value)}${$.attr('aria-disabled', isDisabled)}${$.attr('tabindex', isDisabled ? -1 : 0)}${$.attr('data-dragging', isDragging)}${$.attr('data-disabled', isDisabled)}${$.attr('data-active', isActive())}><div class="scrubber-fill"${$.attr_style('', { width: `${$.stringify(percentage())}%` })}></div> <div class="scrubber-ticks"><!--[-->`);

		const each_array = $.ensure_array_like(Array.from({ length: ticks }, (_, i) => (i + 1) / (ticks + 1) * 100));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let pos = each_array[i];

			$$renderer.push(`<div class="scrubber-tick"${$.attr_style('', { left: `${$.stringify(pos)}%` })}></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="scrubber-thumb-wrapper"${$.attr_style('', { left: `${$.stringify(percentage())}%` })}><div class="scrubber-thumb"></div></div> <div class="scrubber-label">${$.escape(title)}</div> <div class="scrubber-value">${$.escape(formatted())}</div></div></div>`);
	});
}