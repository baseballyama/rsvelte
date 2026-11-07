import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';

export default function BarChartFixedWidthTest($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'vertical');
	const valueAxis = $.derived(() => orientation() === 'horizontal' ? 'x' : 'y');
	const xScale = $.derived(() => $.get(valueAxis) === 'y' ? scaleBand().padding(0.4) : undefined);
	const yScale = $.derived(() => $.get(valueAxis) === 'x' ? scaleBand().padding(0.4) : undefined);

	{
		let $0 = $.derived(() => $.get(valueAxis) === 'x' ? 0 : undefined);
		let $1 = $.derived(() => $.get(valueAxis) === 'y' ? 0 : undefined);
		let $2 = $.derived(() => $.get(valueAxis) === 'y' ? [0, null] : undefined);
		let $3 = $.derived(() => $.get(valueAxis) === 'x' ? [0, null] : undefined);
		let $4 = $.derived(() => $.get(valueAxis) === 'y');
		let $5 = $.derived(() => $.get(valueAxis) === 'x');

		Chart($$anchor, {
			get data() {
				return $$props.data;
			},

			get x() {
				return $$props.x;
			},

			get y() {
				return $$props.y;
			},

			get xScale() {
				return $.get(xScale);
			},

			get yScale() {
				return $.get(yScale);
			},

			get valueAxis() {
				return $.get(valueAxis);
			},

			get xBaseline() {
				return $.get($0);
			},

			get yBaseline() {
				return $.get($1);
			},

			get yDomain() {
				return $.get($2);
			},

			get xDomain() {
				return $.get($3);
			},

			get yNice() {
				return $.get($4);
			},

			get xNice() {
				return $.get($5);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Bars($$anchor, {
							get width() {
								return $$props.barWidth;
							},

							get height() {
								return $$props.barHeight;
							}
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}