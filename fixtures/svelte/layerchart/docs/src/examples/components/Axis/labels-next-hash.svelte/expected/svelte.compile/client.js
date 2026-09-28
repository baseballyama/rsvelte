import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Labels_next_hash($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeDay.offset(today, -10), today]);

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},
			padding: 24,
			height: 48,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Axis($$anchor, {
							placement: 'bottom',
							rule: true,
							tickLabelProps: { textAnchor: 'start', dx: 8, dy: 4 },
							ticks: (scale) => scale.ticks?.().slice(0, -1),
							tickLength: 22
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