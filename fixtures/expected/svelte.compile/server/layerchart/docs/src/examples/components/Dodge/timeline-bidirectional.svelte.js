import * as $ from 'svelte/internal/server';
import { ascending } from 'd3-array';
import { Chart, Circle, Dodge, Line, Text } from 'layerchart';
import { getSvelteMilestones } from '$lib/data.remote';

const milestones = await getSvelteMilestones();

export default function Timeline_bidirectional($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Split by category: Svelte + Ecosystem above the baseline, SvelteKit below.
		const data = milestones.map((m) => ({
			date: m.date,
			category: m.category,
			label: m.label.replace(/\n/g, ' '),
			side: m.category === 'sveltekit' ? 'below' : 'above'
		})).sort((a, b) => ascending(a.date, b.date));

		const series = [
			{ key: 'svelte', label: 'Svelte', color: 'var(--color-danger)' },
			{
				key: 'sveltekit',
				label: 'SvelteKit',
				color: 'var(--color-surface-content)'
			},

			{
				key: 'ecosystem',
				label: 'Ecosystem',
				color: 'var(--color-info)'
			}
		];

		function labelHalfWidth(label) {
			return label.length * 6.5 / 2;
		}

		{
			function marks($$renderer, { context }) {
				const visibleSeries = context.series.visibleSeries;
				const visibleKeys = new Set(visibleSeries.map((s) => s.key));
				const visibleData = data.filter((d) => visibleKeys.has(d.category));
				const baselineY = context.height / 2;
				const above = visibleData.filter((d) => d.side === 'above');
				const below = visibleData.filter((d) => d.side === 'below');

				Line($$renderer, {
					x1: 0,
					x2: context.width,
					y1: baselineY,
					y2: baselineY,
					class: 'stroke-surface-content/40'
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { items: dodged }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(dodged);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: item, x, y, index } = each_array[$$index];
							const series = visibleSeries.find((s) => s.key === item.category);
							const opacity = context.series.isHighlighted(item.category, true) ? 1 : 0.2;
							const labelY = y - 6;

							Line($$renderer, {
								x1: x,
								x2: x,
								y1: baselineY - 4,
								y2: labelY + 6,
								opacity: 0.25 * opacity
							});

							$$renderer.push(`<!----> `);

							Circle($$renderer, {
								cx: x,
								cy: baselineY,
								r: 3,
								fill: series?.color,
								opacity,
								class: 'stroke-surface-100'
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								x,
								y: labelY,
								value: item.label,
								textAnchor: 'middle',
								verticalAnchor: 'middle',
								fill: series?.color,
								opacity,
								class: 'text-[11px]'
							});

							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						data: above,
						axis: 'y',
						anchor: 'bottom',
						baseline: baselineY,
						padding: 4,
						rx: (d) => labelHalfWidth(d.label),
						ry: 8,
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { items: dodged }) {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(dodged);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let { data: item, x, y, index } = each_array_1[$$index_1];
							const series = visibleSeries.find((s) => s.key === item.category);
							const opacity = context.series.isHighlighted(item.category, true) ? 1 : 0.2;
							const labelY = y + 6;

							Line($$renderer, {
								x1: x,
								x2: x,
								y1: baselineY + 4,
								y2: labelY - 6,
								opacity: 0.25 * opacity
							});

							$$renderer.push(`<!----> `);

							Circle($$renderer, {
								cx: x,
								cy: baselineY,
								r: 3,
								fill: series?.color,
								opacity,
								class: 'stroke-surface-100'
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								x,
								y: labelY,
								value: item.label,
								textAnchor: 'middle',
								verticalAnchor: 'middle',
								fill: series?.color,
								opacity,
								class: 'text-[11px]'
							});

							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						data: below,
						axis: 'y',
						anchor: 'top',
						baseline: baselineY,
						padding: 4,
						rx: (d) => labelHalfWidth(d.label),
						ry: 8,
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!---->`);
			}

			Chart($$renderer, {
				data,
				x: 'date',
				series,
				padding: { top: 12, bottom: 12 },
				xPadding: [50, 50],
				height: 400,
				transform: {
					mode: 'domain',
					axis: 'x',
					scaleExtent: [1, 50],
					domainExtent: { x: { min: 'data', max: 'data' } }
				},
				motion: { type: 'spring' },
				clip: true,
				axis: false,
				rule: false,
				grid: false,
				legend: { placement: 'top', variant: 'swatches' },
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}