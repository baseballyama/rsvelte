import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';

export default function LinearGradient_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('linearGradient-', uid),
			stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
			vertical = false,
			rotate,
			children
		} = $$props;

		function createCSSGradient() {
			if (!stops?.length) return '';

			let direction;

			if (rotate !== undefined) {
				// Convert SVG rotation to CSS linear-gradient angle
				// SVG: rotate(0) on horizontal gradient = left-to-right = CSS 90deg
				// SVG: rotate(0) on vertical gradient = top-to-bottom = CSS 180deg
				const baseAngle = vertical ? 180 : 90;

				const cssAngle = baseAngle + rotate;

				direction = `${cssAngle}deg`;
			} else {
				direction = vertical ? 'to bottom' : 'to right';
			}

			const cssStops = stops.map((stop, i) => {
				if (Array.isArray(stop)) {
					return `${stop[1]} ${stop[0]}`;
				} else {
					return `${stop} ${i * (100 / (stops.length - 1))}%`;
				}
			}).join(', ');

			return `linear-gradient(${direction}, ${cssStops})`;
		}

		children?.($$renderer, { id, gradient: createCSSGradient() });
		$$renderer.push(`<!---->`);
	});
}