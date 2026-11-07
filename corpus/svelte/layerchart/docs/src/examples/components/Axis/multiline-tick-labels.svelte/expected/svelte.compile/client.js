import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeMonth, timeYear } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Multiline_tick_labels($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeYear.offset(today, -2), today]);
		let $1 = $.derived(() => defaultChartPadding({ bottom: 30 }));

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
						{
							let $0 = $.derived(() => ({ interval: timeMonth.every(3) }));

							Axis($$anchor, {
								placement: 'bottom',
								get ticks() {
									return $.get($0);
								},
								format: (d) => 'Q' + (d.getMonth() / 3 + 1) + (d.getMonth() === 0 ? '\n' + d.getFullYear() : ''),
								rule: true
							});
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}