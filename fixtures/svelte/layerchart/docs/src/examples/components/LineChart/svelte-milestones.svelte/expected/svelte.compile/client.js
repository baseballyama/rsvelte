import 'svelte/internal/disclose-version';
import { getSvelteCounts, getSvelteMilestones } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationPoint, defaultChartPadding, Layer, LineChart } from 'layerchart';
import { bisector, extent, max } from 'd3-array';

const [counts, milestones] = await Promise.all([getSvelteCounts(), getSvelteMilestones()]);

export default function Svelte_milestones($$anchor, $$props) {
	$.push($$props, true);

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
		const selectedKeys = $.get(context)?.series.selectedKeys;

		if (!selectedKeys || selectedKeys.isEmpty()) return true;

		return selectedKeys.isSelected('svelte') || selectedKeys.isSelected('sveltekit');
	});

	const xDomain = $.derived(() => $.get(hasVisibleSpline) ? undefined : fallbackXDomain);
	const yDomain = $.derived(() => $.get(hasVisibleSpline) ? undefined : [0, fallbackYMax]);
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

	let context = $.state(void 0);

	// Extend the y-domain so the tallest visible milestone label fits in-chart —
	// matters most when only SvelteKit is selected (its data max is well below
	// the tallest sveltekit label, e.g. "stream file uploads" at y=245).
	const yPaddingTop = $.derived(() => {
		const selectedKeys = $.get(context)?.series.selectedKeys;

		return selectedKeys?.isSelected('sveltekit') && !selectedKeys.isSelected('svelte') ? 40 : 20;
	});

	const data = { counts, milestones };
	var $$exports = { data };

	{
		const aboveContext = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const selectedKeys = $.derived(() => context().series.selectedKeys);

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => milestones.filter((m) => $.get(selectedKeys).isEmpty() || $.get(selectedKeys).isSelected(m.category)), $.index, ($$anchor, m) => {
						const dotDomainY = $.derived(() => $.get(m).category === 'ecosystem'
							? undefined
							: cumsumAt($.get(m).category === 'svelte' ? svelteSeries : sveltekitSeries, $.get(m).date));

						const h = $.derived(() => $.get(m).dx >= 0 ? 'right' : 'left');
						const v = $.derived(() => $.get(m).dy >= 0 ? 'bottom' : 'top');

						{
							let $0 = $.derived(() => Math.abs($.get(m).dx));
							let $1 = $.derived(() => Math.abs($.get(m).dy));

							let $2 = $.derived(() => ({
								type: 'swoop',
								bend: $.get(m).dx >= 0 ? 22.5 : -22.5,
								class: 'opacity-30'
							}));

							let $3 = $.derived(() => ({
								circle: {
									fill: seriesColor[$.get(m).category],
									class: 'stroke-surface-100'
								},
								label: {
									class: 'text-[11px] fill-surface-content',
									verticalAnchor: 'middle'
								}
							}));

							AnnotationPoint($$anchor, {
								get x() {
									return $.get(m).date;
								},

								get y() {
									return $.get(dotDomainY);
								},
								r: 3,
								get label() {
									return $.get(m).label;
								},

								get labelPlacement() {
									return `${$.get(v) ?? ''}-${$.get(h) ?? ''}`;
								},

								get labelXOffset() {
									return $.get($0);
								},

								get labelYOffset() {
									return $.get($1);
								},

								get link() {
									return $.get($2);
								},

								get props() {
									return $.get($3);
								}
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => [
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
		]);

		let $1 = $.derived(() => defaultChartPadding({ legend: true, top: 20, left: 30, right: 14, bottom: 20 }));
		let $2 = $.derived(() => [0, $.get(yPaddingTop)]);

		LineChart($$anchor, {
			x: 'date',
			get xDomain() {
				return $.get(xDomain);
			},
			y: 'cumsum',
			get yDomain() {
				return $.get(yDomain);
			},

			get series() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},

			get yPadding() {
				return $.get($2);
			},
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
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},
			aboveContext,
			$$slots: { aboveContext: true }
		});
	}

	return $.pop($$exports);
}