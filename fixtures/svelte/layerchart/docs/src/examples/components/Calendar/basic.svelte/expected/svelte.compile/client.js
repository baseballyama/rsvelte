import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { timeYear } from 'd3-time';
import { Calendar, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const now = new Date();
	const firstDayOfYear = timeYear.floor(now);
	const lastDayOfYear = endOfInterval('year', now);

	const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			value: Math.random() > 0.2 ? d.value : null // set null for some values
		};
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleThreshold().unknown('transparent'));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [25, 50, 75],
			cRange: [
				'var(--color-primary-100)',
				'var(--color-primary-300)',
				'var(--color-primary-500)',
				'var(--color-primary-700)'
			],
			padding: { top: 20 },
			height: 140,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Calendar($$anchor, {
							get start() {
								return firstDayOfYear;
							},

							get end() {
								return lastDayOfYear;
							},
							monthPath: true
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}