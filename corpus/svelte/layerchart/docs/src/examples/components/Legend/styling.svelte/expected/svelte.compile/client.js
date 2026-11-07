import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';

export default function Styling($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => scaleSequential([0, 100], interpolateViridis));

		Legend($$anchor, {
			get scale() {
				return $.get($0);
			},
			title: 'Temperature (°F)',
			width: 600,
			tickFontSize: 12,
			tickFormat: (value) => value + '°',
			classes: {
				root: 'px-3 py-2 bg-surface-200',
				title: 'text-lg text-center',
				label: 'fill-surface-content/50',
				tick: 'stroke-surface-100'
			}
		});
	}

	$.pop();
}