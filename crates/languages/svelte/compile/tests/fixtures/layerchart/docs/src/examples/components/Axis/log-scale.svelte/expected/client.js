import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { scaleLog } from 'd3-scale';

export default function Log_scale($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(scaleLog);

		Chart($$anchor, {
			get xScale() {
				return $.get($0);
			},
			xDomain: [1, 100],
			padding: 24,
			height: 48,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Axis($$anchor, { placement: 'bottom', rule: true });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}