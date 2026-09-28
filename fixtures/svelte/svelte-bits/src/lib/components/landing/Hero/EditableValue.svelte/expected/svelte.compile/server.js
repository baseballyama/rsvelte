import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import ColorValue from './ColorValue.svelte';
import { playSound } from '$lib/utils/audio';

export default function EditableValue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type, value, onChange, min = 0, max = 1, step = 0.01 } = $$props;

		function formatValue(val, s) {
			if (s >= 1) return String(Math.round(val));

			const d = Math.max(0, Math.ceil(-Math.log10(s)));

			return val.toFixed(d);
		}

		let numEl = void 0;

		onMount(() => {
			const el = numEl;

			if (!el || type !== 'number') return;

			const onWheel = (e) => {
				e.preventDefault();

				const v = value;
				const dir = e.deltaY < 0 ? 1 : -1;
				let next = v + dir * step;

				next = Math.round(next / step) * step;

				const clamped = Math.max(min, Math.min(max, next));

				if (clamped !== v) playSound('tick', 0.25, 60);

				onChange(clamped);
			};

			el.addEventListener('wheel', onWheel, { passive: false });

			return () => el.removeEventListener('wheel', onWheel);
		});

		function handlePointerDown(e) {
			e.preventDefault();

			const startX = e.clientX;
			const startVal = value;
			let moved = false;
			let lastVal = startVal;

			document.body.style.cursor = 'ew-resize';
			document.body.style.userSelect = 'none';

			const onMove = (ev) => {
				const dx = ev.clientX - startX;

				if (!moved && Math.abs(dx) > 2) moved = true;
				if (!moved) return;

				const sens = ev.shiftKey ? 0.02 : 0.15;
				let next = startVal + dx * step * sens;

				next = Math.round(next / step) * step;

				const clamped = Math.max(min, Math.min(max, next));

				if (clamped !== lastVal) playSound('tick', 0.25, 60);

				lastVal = clamped;
				onChange(clamped);
			};

			const onUp = () => {
				document.removeEventListener('pointermove', onMove);
				document.removeEventListener('pointerup', onUp);
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
			};

			document.addEventListener('pointermove', onMove);
			document.addEventListener('pointerup', onUp);
		}

		if (type === 'color') {
			$$renderer.push('<!--[0-->');
			ColorValue($$renderer, { value, onChange: (v) => onChange(v) });
		} else if (type === 'boolean') {
			$$renderer.push(`<!--[1--><button class="ln-hero-code-value ln-hero-code-value--bool">${$.escape(String(value))}</button>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="ln-hero-code-value ln-hero-code-value--number" role="slider" tabindex="-1"${$.attr('aria-valuenow', value)}${$.attr('aria-valuemin', min)}${$.attr('aria-valuemax', max)}>${$.escape(formatValue(value, step))}</span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}