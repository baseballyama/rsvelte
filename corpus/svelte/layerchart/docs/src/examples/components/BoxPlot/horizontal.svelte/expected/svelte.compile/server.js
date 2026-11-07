import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, BoxPlot, Chart, Layer } from 'layerchart';

export default function Horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				group: 'A',
				values: [
					2,
					7,
					8,
					12,
					15,
					18,
					21,
					25,
					27,
					30,
					32,
					35,
					38,
					40,
					42,
					45,
					50,
					55,
					60,
					85
				]
			},

			{
				group: 'B',
				values: [
					10,
					15,
					18,
					20,
					22,
					25,
					28,
					30,
					32,
					35,
					37,
					40,
					42,
					45,
					48,
					50,
					55,
					58,
					62,
					65
				]
			},

			{
				group: 'C',
				values: [
					5,
					8,
					10,
					12,
					15,
					18,
					20,
					22,
					25,
					28,
					30,
					33,
					35,
					38,
					40,
					42,
					45,
					48,
					70,
					75
				]
			},

			{
				group: 'D',
				values: [
					1,
					20,
					25,
					30,
					35,
					38,
					40,
					42,
					45,
					48,
					50,
					52,
					55,
					58,
					60,
					62,
					65,
					70,
					75,
					95
				]
			}
		];

		Chart($$renderer, {
			data,
			y: 'group',
			yScale: scaleBand().padding(0.3),
			xDomain: [0, 100],
			xNice: true,
			valueAxis: 'x',
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(data);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							BoxPlot($$renderer, { data: item, values: 'values' });
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}