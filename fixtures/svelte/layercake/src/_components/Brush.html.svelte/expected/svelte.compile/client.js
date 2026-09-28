import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clamp } from 'yootils';

var root = $.from_html(`<div class="brush-inner svelte-4c8z9u" draggable="false"></div> <div class="brush-handle svelte-4c8z9u" draggable="false"></div> <div class="brush-handle svelte-4c8z9u" draggable="false"></div>`, 1);
var root_1 = $.from_html(`<div class="brush-outer svelte-4c8z9u"><!></div>`);

export default function Brush_html($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {number|null} min - The brush's min value. Useful to bind to.
	 * @property {number|null} max - The brush's max value. Useful to bind to.
	 */
	/** @type {Props} */
	let min = $.prop($$props, 'min', 15),
		max = $.prop($$props, 'max', 15);

	let brush = $.state(void 0);

	const p = (x) => {
		const { left, right } = $.get(brush).getBoundingClientRect();

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
			const start = { min: min(), max: max(), p: p(e.clientX) };

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
				} else if (e.target === $.get(brush)) {
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
		min(null);
		max(null);
	};

	const reset = handler((start, p) => {
		min(clamp(Math.min(start.p, p), 0, 1));
		max(clamp(Math.max(start.p, p), 0, 1));
	});

	const move = handler((start, p) => {
		const d = clamp(p - start.p, -start.min, 1 - start.max);

		min(start.min + d);
		max(start.max + d);
	});

	const adjust_min = handler((start, p) => {
		min(p > start.max ? start.max : p);
		max(p > start.max ? p : start.max);
	});

	const adjust_max = handler((start, p) => {
		min(p < start.min ? p : start.min);
		max(p < start.min ? start.min : p);
	});

	let left = $.derived(() => min() !== null ? 100 * min() : null);
	let right = $.derived(() => max() !== null ? 100 * (1 - max()) : null);
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var div_1 = $.first_child(fragment);
			var div_2 = $.sibling(div_1, 2);
			var div_3 = $.sibling(div_2, 2);

			$.template_effect(() => {
				$.set_style(div_1, `left: ${$.get(left) ?? ''}%; right: ${$.get(right) ?? ''}%`);
				$.set_style(div_2, `left: ${$.get(left) ?? ''}%`);
				$.set_style(div_3, `right: ${$.get(right) ?? ''}%`);
			});

			$.delegated('mousedown', div_1, move);
			$.delegated('touchstart', div_1, move, void 0, true);
			$.delegated('mousedown', div_2, adjust_min);
			$.delegated('touchstart', div_2, adjust_min, void 0, true);
			$.delegated('mousedown', div_3, adjust_max);
			$.delegated('touchstart', div_3, adjust_max, void 0, true);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (min() !== null) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(brush, $$value), () => $.get(brush));
	$.delegated('mousedown', div, reset);
	$.delegated('touchstart', div, reset, void 0, true);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousedown', 'touchstart']);