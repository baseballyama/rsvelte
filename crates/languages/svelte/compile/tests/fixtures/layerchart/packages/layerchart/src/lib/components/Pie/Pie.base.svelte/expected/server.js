import * as $ from 'svelte/internal/server';
import { PieState } from './Pie.shared.svelte.js';

export default function Pie_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Arc,
			data,
			range,
			startAngle,
			endAngle,
			innerRadius,
			outerRadius,
			cornerRadius = 0,
			padAngle = 0,
			motion,
			offset = 0,
			tooltip,
			sort,
			children
		} = $$props;

		const c = new PieState(() => ({
			data,
			range,
			startAngle,
			endAngle,
			innerRadius,
			outerRadius,
			cornerRadius,
			padAngle,
			motion,
			offset,
			tooltip,
			sort
		}));

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer, { arcs: c.arcs });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(c.arcs);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let arc = each_array[$$index];

				if (Arc) {
					$$renderer.push('<!--[-->');

					Arc($$renderer, {
						class: 'lc-pie-arc',
						startAngle: arc.startAngle,
						endAngle: arc.endAngle,
						padAngle: arc.padAngle,
						innerRadius,
						outerRadius,
						cornerRadius,
						offset,
						fill: c.ctx.config.c ? c.ctx.cScale?.(c.ctx.c(arc.data)) : null,
						data: arc.data,
						tooltip
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}