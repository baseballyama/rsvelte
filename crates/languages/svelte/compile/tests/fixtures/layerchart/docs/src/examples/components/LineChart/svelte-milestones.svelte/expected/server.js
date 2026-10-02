import * as $ from 'svelte/internal/server';
import { AnnotationPoint, defaultChartPadding, Layer, LineChart } from 'layerchart';
import { bisector, extent, max } from 'd3-array';
import { getSvelteCounts, getSvelteMilestones } from '$lib/data.remote';

const [counts, milestones] = await Promise.all([getSvelteCounts(), getSvelteMilestones()]);

export default function Svelte_milestones($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const svelteSeries = counts.filter((d) => d.category === 'svelte');
		const sveltekitSeries = counts.filter((d) => d.category === 'sveltekit');

		// Fallback domains used only when no spline series is visible (i.e. when
		// Ecosystem alone is selected — it has no data of its own, so the chart
		// would otherwise have nothing to derive the axes from). When at least
		// one spline is visible we leave the domains unset and let the chart's
		// auto-derive shrink the y-axis to fit just the visible series' data.
		const allCounts = [...svelteSeries, ...sveltekitSeries];

		const fallbackXDomain = extent(allCounts, (d) => d.date);
		const fallbackYMax = max(allCounts, (d) => d.cumsum) ?? 0;

		const hasVisibleSpline = $.derived(() => {
			const selectedKeys = context?.series.selectedKeys;

			if (!selectedKeys || selectedKeys.isEmpty()) return true;

			return selectedKeys.isSelected('svelte') || selectedKeys.isSelected('sveltekit');
		});

		const xDomain = $.derived(() => hasVisibleSpline() ? undefined : fallbackXDomain);
		const yDomain = $.derived(() => hasVisibleSpline() ? undefined : [0, fallbackYMax]);
		const bisect = bisector((d) => d.date).right;

		function cumsumAt(series, date) {
			const i = bisect(series, date) - 1;

			return i >= 0 ? series[i].cumsum : 0;
		}

		const seriesColor = {
			svelte: 'var(--color-danger)',
			sveltekit: 'var(--color-surface-content)',
			ecosystem: 'var(--color-info)'
		};

		let context = void 0;

		// Extend the y-domain so the tallest visible milestone label fits in-chart —
		// matters most when only SvelteKit is selected (its data max is well below
		// the tallest sveltekit label, e.g. "stream file uploads" at y=245).
		const yPaddingTop = $.derived(() => {
			const selectedKeys = context?.series.selectedKeys;

			return selectedKeys?.isSelected('sveltekit') && !selectedKeys.isSelected('svelte') ? 40 : 20;
		});

		const data = { counts, milestones };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function aboveContext($$renderer, { context }) {
					const selectedKeys = context.series.selectedKeys;

					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(milestones.filter((m) => selectedKeys.isEmpty() || selectedKeys.isSelected(m.category)));

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let m = each_array[i];

								const dotDomainY = m.category === 'ecosystem'
									? undefined
									: cumsumAt(m.category === 'svelte' ? svelteSeries : sveltekitSeries, m.date);

								const h = m.dx >= 0 ? 'right' : 'left';
								const v = m.dy >= 0 ? 'bottom' : 'top';

								AnnotationPoint($$renderer, {
									x: m.date,
									y: dotDomainY,
									r: 3,
									label: m.label,
									labelPlacement: `${v}-${h}`,
									labelXOffset: Math.abs(m.dx),
									labelYOffset: Math.abs(m.dy),
									link: {
										type: 'swoop',
										bend: m.dx >= 0 ? 22.5 : -22.5,
										class: 'opacity-30'
									},
									props: {
										circle: { fill: seriesColor[m.category], class: 'stroke-surface-100' },
										label: {
											class: 'text-[11px] fill-surface-content',
											verticalAnchor: 'middle'
										}
									}
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				}

				LineChart($$renderer, {
					x: 'date',
					xDomain: xDomain(),
					y: 'cumsum',
					yDomain: yDomain(),
					series: [
						{
							key: 'svelte',
							label: 'Svelte',
							data: svelteSeries,
							color: seriesColor.svelte
						},

						{
							key: 'sveltekit',
							label: 'SvelteKit',
							data: sveltekitSeries,
							color: seriesColor.sveltekit
						},

						{
							key: 'ecosystem',
							label: 'Ecosystem',
							color: seriesColor.ecosystem
						}
					],
					padding: defaultChartPadding({ legend: true, top: 20, left: 30, right: 14, bottom: 20 }),
					yPadding: [0, yPaddingTop()],
					height: 400,
					brush: true,
					transform: {
						mode: 'domain',
						axis: 'x',
						scaleExtent: [1, 50],
						domainExtent: { x: { min: 'data', max: 'data' } }
					},
					motion: { type: 'spring' },
					clip: true,
					legend: true,
					get context() {
						return context;
					},

					set context($$value) {
						context = $$value;
						$$settled = false;
					},
					aboveContext,
					$$slots: { aboveContext: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}