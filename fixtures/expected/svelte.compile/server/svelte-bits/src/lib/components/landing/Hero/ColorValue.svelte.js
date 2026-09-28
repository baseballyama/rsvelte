import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { hexToHsv, hsvToHex } from '$lib/utils/color';
import { playSound } from '$lib/utils/audio';

export default function ColorValue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, onChange } = $$props;

		// Orange-leaning palette (Svelte brand first), keep some hue variety
		const COLOR_PRESETS = [
			'#FF3E00',
			'#FF8A4C',
			'#F97316',
			'#EAB308',
			'#10B981',
			'#06B6D4',
			'#3B82F6',
			'#6366F1',
			'#EC4899',
			'#EF4444'
		];

		let open = false;
		let hsv = hexToHsv(value);
		let wrapEl = void 0;
		let areaEl = void 0;
		let hueEl = void 0;

		onMount(() => {
			const onClickOutside = (e) => {
				if (!open) return;
				if (wrapEl && !wrapEl.contains(e.target)) open = false;
			};

			document.addEventListener('pointerdown', onClickOutside);

			return () => document.removeEventListener('pointerdown', onClickOutside);
		});

		function applyHsv(next) {
			hsv = next;
			onChange(hsvToHex(next.h, next.s, next.v));
		}

		function startDrag(onMove, onEnd) {
			document.addEventListener('pointermove', onMove);

			const onUp = () => {
				document.removeEventListener('pointermove', onMove);
				document.removeEventListener('pointerup', onUp);
				onEnd?.();
			};

			document.addEventListener('pointerup', onUp);
		}

		function onAreaDown(e) {
			e.preventDefault();
			e.stopPropagation();

			const update = (ev) => {
				if (!areaEl) return;

				const rect = areaEl.getBoundingClientRect();
				const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
				const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));

				applyHsv({ h: hsv.h, s: x, v: 1 - y });
			};

			update(e);
			startDrag(update);
		}

		function onHueDown(e) {
			e.preventDefault();
			e.stopPropagation();

			const update = (ev) => {
				if (!hueEl) return;

				const rect = hueEl.getBoundingClientRect();
				const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));

				applyHsv({ s: hsv.s, v: hsv.v, h: x * 360 });
			};

			update(e);
			startDrag(update);
		}

		let hueColor = $.derived(() => hsvToHex(hsv.h, 1, 1));

		$$renderer.push(`<span class="ln-hero-code-value ln-hero-code-value--color" style="position: relative;"><span class="ln-hero-code-swatch"${$.attr_style(`background: ${$.stringify(value)}; cursor: pointer;`)} role="button" tabindex="0" aria-label="Open color picker"></span> <span style="cursor: pointer;" role="button" tabindex="0">"${$.escape(value)}"</span> `);

		if (open) {
			$$renderer.push(`<!--[0--><div class="ln-hero-color-picker"><div class="ln-hero-color-picker-area" role="slider" tabindex="-1" aria-label="Saturation and value"${$.attr('aria-valuenow', hsv.s)}${$.attr_style(`background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${$.stringify(hueColor())})`)}><div class="ln-hero-color-picker-thumb"${$.attr_style(`left: ${$.stringify(hsv.s * 100)}%; top: ${$.stringify((1 - hsv.v) * 100)}%;`)}></div></div> <div class="ln-hero-color-picker-hue" role="slider" tabindex="-1" aria-label="Hue"${$.attr('aria-valuenow', hsv.h)}><div class="ln-hero-color-picker-thumb"${$.attr_style(`left: ${$.stringify(hsv.h / 360 * 100)}%; top: 50%;`)}></div></div> <div class="ln-hero-color-picker-presets"><!--[-->`);

			const each_array = $.ensure_array_like(COLOR_PRESETS);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let c = each_array[$$index];

				$$renderer.push(`<button class="ln-hero-color-picker-preset"${$.attr_style(`background: ${$.stringify(c)}; border-color: ${value.toLowerCase() === c.toLowerCase() ? '#fff' : 'rgba(255,255,255,0.12)'};`)}${$.attr('aria-label', `Preset ${$.stringify(c)}`)}></button>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span>`);
	});
}