import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Tick_label_styling($$anchor, $$props) {
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
							classes: {
								rule: 'stroke-primary',
								tick: 'stroke-primary/50',
								tickLabel: 'fill-primary font-semibold'
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