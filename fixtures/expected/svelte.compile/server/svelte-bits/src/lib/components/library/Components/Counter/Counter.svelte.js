import * as $ from 'svelte/internal/server';
import { motionValue, animate } from 'motion';

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			fontSize = 100,
			padding = 0,
			places,
			gap = 8,
			borderRadius = 4,
			horizontalPadding = 8,
			textColor = 'inherit',
			fontWeight = 'inherit',
			containerStyle = '',
			counterStyle = '',
			digitStyle = '',
			gradientHeight = 16,
			gradientFrom = 'black',
			gradientTo = 'transparent',
			topGradientStyle = '',
			bottomGradientStyle = ''
		} = $$props;

		function autoPlaces(v) {
			const a = [...v.toString()];

			return a.map((ch, i) => {
				if (ch === '.') return '.';

				const dotIndex = a.indexOf('.');
				const isInteger = dotIndex === -1;

				const exponent = isInteger
					? a.length - i - 1
					: i < dotIndex ? dotIndex - i - 1 : -(i - dotIndex);

				return 10 ** exponent;
			});
		}

		const resolvedPlaces = $.derived(() => places ?? autoPlaces(value));
		const height = $.derived(() => fontSize + padding);

		function normalizeNearInteger(num) {
			const nearest = Math.round(num);
			const tolerance = 1e-9 * Math.max(1, Math.abs(num));

			return Math.abs(num - nearest) < tolerance ? nearest : num;
		}

		function getValueRoundedToPlace(v, place) {
			return Math.floor(normalizeNearInteger(v / place));
		}

		// One motion value per digit slot, plus a reactive latestValues record so the
		// rendered transform updates on every motion-driven tick.
		const motionValues = new Map();

		let latestValues = {};

		function getOrCreateMV(slot, target) {
			let mv = motionValues.get(slot);

			if (!mv) {
				mv = motionValue(target);
				motionValues.set(slot, mv);
				latestValues[slot] = target;

				mv.on('change', (v) => {
					latestValues = { ...latestValues, [slot]: v };
				});
			}

			return mv;
		}

		function offsetForNumber(latest, number, h) {
			const placeValue = latest % 10;
			const offset = (10 + number - placeValue) % 10;
			let memo = offset * h;

			if (offset > 5) memo -= 10 * h;

			return memo;
		}

		$$renderer.push(`<span${$.attr_style(`position:relative;display:inline-block;${$.stringify(containerStyle)}`)}><span${$.attr_style(`font-size:${$.stringify(fontSize)}px;display:flex;gap:${$.stringify(gap)}px;overflow:hidden;border-radius:${$.stringify(borderRadius)}px;padding-left:${$.stringify(horizontalPadding)}px;padding-right:${$.stringify(horizontalPadding)}px;line-height:1;color:${$.stringify(textColor)};font-weight:${$.stringify(fontWeight)};direction:ltr;${$.stringify(counterStyle)}`)}><!--[-->`);

		const each_array = $.ensure_array_like(resolvedPlaces());

		for (let slot = 0, $$length = each_array.length; slot < $$length; slot++) {
			let place = each_array[slot];

			if (place === '.') {
				$$renderer.push(`<!--[0--><span class="relative inline-flex items-center justify-center"${$.attr_style(`height:${$.stringify(height())}px;width:fit-content;${$.stringify(digitStyle)}`)}>.</span>`);
			} else {
				$$renderer.push(`<!--[-1--><span class="relative inline-flex overflow-hidden"${$.attr_style(`height:${$.stringify(height())}px;width:1ch;font-variant-numeric:tabular-nums;${$.stringify(digitStyle)}`)}><!--[-->`);

				const each_array_1 = $.ensure_array_like(Array.from({ length: 10 }, (_, i) => i));

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let n = each_array_1[$$index];

					$$renderer.push(`<span${$.attr_style(`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:translateY(${$.stringify(offsetForNumber(latestValues[slot] ?? getValueRoundedToPlace(value, place), n, height()))}px);`)}>${$.escape(n)}</span>`);
				}

				$$renderer.push(`<!--]--></span>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></span> <span style="pointer-events:none;position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;"><span${$.attr_style(topGradientStyle || `height:${gradientHeight}px;background:linear-gradient(to bottom, ${gradientFrom}, ${gradientTo});`)}></span> <span${$.attr_style(bottomGradientStyle || `height:${gradientHeight}px;background:linear-gradient(to top, ${gradientFrom}, ${gradientTo});`)}></span></span></span>`);
	});
}