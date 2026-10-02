import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Beeswarm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, zGet, height, config } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [r=3] - The circle radius size in pixels.
		 * @property {number} [strokeWidth=0] - The circle's stroke width in pixels.
		 * @property {string} [stroke='#fff'] - The circle's stroke color.
		 * @property {number} [spacing=1.5] - Whitespace padding between each circle, in pixels
		 * @property {Function} [getTitle] - An accessor function to get the field on the data element to display as a hover label using a `<title>` tag.
		 */
		/** @type {Props} */
		let {
			r = 3,
			strokeWidth = 0,
			stroke = '#fff',
			spacing = 1.5,
			getTitle
		} = $$props;

		function dodge(data, { rds = 1, x = (d) => d } = {}) {
			const radius2 = rds ** 2;

			const circles = data.map((d) => ({
				x: x(d),
				[$.store_get($$store_subs ??= {}, '$config', config).z]: d[$.store_get($$store_subs ??= {}, '$config', config).z],
				data: d
			})).sort((a, b) => a.x - b.x);

			const epsilon = 1e-3;
			let head = null, tail = null;

			// Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
			function intersects(x, y) {
				let a = head;

				while (a) {
					if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
						return true;
					}

					a = a.next;
				}

				return false;
			}

			// Place each circle sequentially.
			for (const b of circles) {
				// Remove circles from the queue that can’t intersect the new circle b.
				while (head && head.x < b.x - radius2) head = head.next;

				// Choose the minimum non-intersecting tangent.
				if (intersects(b.x, b.y = 0)) {
					let a = head;

					b.y = Infinity;

					do {
						let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);

						if (y < b.y && !intersects(b.x, y)) b.y = y;

						a = a.next;
					} while (a);
				}

				// Add b to the queue.
				b.next = null;

				if (head === null) head = tail = b; else {
					tail.next = b;
					tail = b;
				}
			}

			return circles;
		}

		let circles = $.derived(() => dodge($.store_get($$store_subs ??= {}, '$data', data), {
			rds: r * 2 + spacing + strokeWidth,
			x: $.store_get($$store_subs ??= {}, '$xGet', xGet)
		}));

		$$renderer.push(`<g class="bee-group"><!--[-->`);

		const each_array = $.ensure_array_like(circles());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<circle${$.attr('fill', $.store_get($$store_subs ??= {}, '$zGet', zGet)(d))}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}${$.attr('cx', d.x)}${$.attr('cy', $.store_get($$store_subs ??= {}, '$height', height) - r - spacing - strokeWidth / 2 - d.y)}${$.attr('r', r)}>`);

			if (getTitle) {
				$$renderer.push(`<!--[0--><title>${$.escape(getTitle(d))}</title>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></circle>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}