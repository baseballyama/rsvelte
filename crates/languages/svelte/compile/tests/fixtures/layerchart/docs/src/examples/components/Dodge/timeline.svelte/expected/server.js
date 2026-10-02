import * as $ from 'svelte/internal/server';
import { Chart, Circle, Dodge, Layer, Line, Text } from 'layerchart';
import { getSvelteMilestones } from '$lib/data.remote';

const milestones = await getSvelteMilestones();

export default function Timeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = milestones.map((m) => ({
			date: m.date,
			category: m.category,
			label: m.label.replace(/\n/g, ' ')
		}));

		/** Estimate the half width of a label based on its character length */
		function labelHalfWidth(label) {
			return label.length * 6.5 / 2;
		}

		{
			function aboveContext($$renderer, { context }) {
				const visibleSeries = context.series.visibleSeries;
				const visibleKeys = new Set(visibleSeries.map((s) => s.key));
				const visibleItems = data.filter((d) => visibleKeys.has(d.category));
				const baselineY = context.height;

				Layer($$renderer, {
					children: ($$renderer) => {
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
								data: visibleItems,
								axis: 'y',
								anchor: 'bottom',
								padding: 4,
								rx: (d) => labelHalfWidth(d.label),
								ry: 8,
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'date',
				series: [
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
				],
				padding: { top: 24, bottom: 24 },
				xPadding: [50, 50],
				height: 360,
				transform: {
					mode: 'domain',
					axis: 'x',
					scaleExtent: [1, 50],
					domainExtent: { x: { min: 'data', max: 'data' } }
				},
				motion: { type: 'spring' },
				clip: true,
				axis: 'x',
				legend: { placement: 'top', variant: 'swatches' },
				aboveContext,
				$$slots: { aboveContext: true }
			});
		}

		$.bind_props($$props, { data });
	});
}