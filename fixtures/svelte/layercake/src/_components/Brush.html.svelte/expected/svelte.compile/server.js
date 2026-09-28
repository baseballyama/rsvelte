import * as $ from 'svelte/internal/server';
import { clamp } from 'yootils';

export default function Brush_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {number|null} min - The brush's min value. Useful to bind to.
		 * @property {number|null} max - The brush's max value. Useful to bind to.
		 */
		/** @type {Props} */
		let { min = void 0, max = void 0 } = $$props;

		let brush = void 0;

		const p = (x) => {
			const { left, right } = brush.getBoundingClientRect();

			return clamp((x - left) / (right - left), 0, 1);
		};

		const handler = (fn) => {
			return (e) => {
				e.stopPropagation();
				e.preventDefault(); // Prevent default drag behavior

				if (e.type === 'touchstart') {
					if (e.touches.length !== 1) return;

					e = e.touches[0];
				}

				const id = e.identifier;
				const start = { min, max, p: p(e.clientX) };

				const handle_move = (e) => {
					e.preventDefault(); // Prevent default drag behavior during move

					if (e.type === 'touchmove') {
						if (e.changedTouches.length !== 1) return;

						e = e.changedTouches[0];

						if (e.identifier !== id) return;
					}

					fn(start, p(e.clientX));
				};

				const handle_end = (e) => {
					if (e.type === 'touchend') {
						if (e.changedTouches.length !== 1) return;
						if (e.changedTouches[0].identifier !== id) return;
					} else if (e.target === brush) {
						clear();
					}

					window.removeEventListener('mousemove', handle_move);
					window.removeEventListener('mouseup', handle_end);
					window.removeEventListener('touchmove', handle_move);
					window.removeEventListener('touchend', handle_end);
				};

				window.addEventListener('mousemove', handle_move);
				window.addEventListener('mouseup', handle_end);
				window.addEventListener('touchmove', handle_move);
				window.addEventListener('touchend', handle_end);
			};
		};

		const clear = () => {
			min = null;
			max = null;
		};

		const reset = handler((start, p) => {
			min = clamp(Math.min(start.p, p), 0, 1);
			max = clamp(Math.max(start.p, p), 0, 1);
		});

		const move = handler((start, p) => {
			const d = clamp(p - start.p, -start.min, 1 - start.max);

			min = start.min + d;
			max = start.max + d;
		});

		const adjust_min = handler((start, p) => {
			min = p > start.max ? start.max : p;
			max = p > start.max ? p : start.max;
		});

		const adjust_max = handler((start, p) => {
			min = p < start.min ? p : start.min;
			max = p < start.min ? start.min : p;
		});

		let left = $.derived(() => min !== null ? 100 * min : null);
		let right = $.derived(() => max !== null ? 100 * (1 - max) : null);

		$$renderer.push(`<div class="brush-outer svelte-4c8z9u">`);

		if (min !== null) {
			$$renderer.push(`<!--[0--><div class="brush-inner svelte-4c8z9u" draggable="false"${$.attr_style(`left: ${$.stringify(left())}%; right: ${$.stringify(right())}%`)}></div> <div class="brush-handle svelte-4c8z9u" draggable="false"${$.attr_style(`left: ${$.stringify(left())}%`)}></div> <div class="brush-handle svelte-4c8z9u" draggable="false"${$.attr_style(`right: ${$.stringify(right())}%`)}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { min, max });
	});
}