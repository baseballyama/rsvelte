import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Remove_tick_marks($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeDay.offset(today, -10), today]);
		let $1 = $.derived(() => defaultChartPadding({ bottom: 40 }));

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 48,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Axis($$anchor, { placement: 'bottom', rule: true, tickMarks: false });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}