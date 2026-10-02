import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { timeYear } from 'd3-time';
import { Calendar, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const now = new Date();
		const firstDayOfYear = timeYear.floor(now);
		const lastDayOfYear = endOfInterval('year', now);

		const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
			return {
				...d,
				value: Math.random() > 0.2 ? d.value : null // set null for some values
			};
		});

		Chart($$renderer, {
			data,
			x: 'date',
			c: 'value',
			cScale: scaleThreshold().unknown('transparent'),
			cDomain: [25, 50, 75],
			cRange: [
				'var(--color-primary-100)',
				'var(--color-primary-300)',
				'var(--color-primary-500)',
				'var(--color-primary-700)'
			],
			padding: { top: 20 },
			height: 140,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Calendar($$renderer, { start: firstDayOfYear, end: lastDayOfYear, monthPath: true });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}