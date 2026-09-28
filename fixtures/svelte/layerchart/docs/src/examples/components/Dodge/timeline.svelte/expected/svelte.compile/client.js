import 'svelte/internal/disclose-version';
import { getSvelteMilestones } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Dodge, Layer, Line, Text } from 'layerchart';

const milestones = await getSvelteMilestones();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Timeline($$anchor, $$props) {
	$.push($$props, true);

	const data = milestones.map((m) => ({
		date: m.date,
		category: m.category,
		label: m.label.replace(/\n/g, ' ')
	}));

	/** Estimate the half width of a label based on its character length */
	function labelHalfWidth(label) {
		return label.length * 6.5 / 2;
	}

	var $$exports = { data };

	{
		const aboveContext = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const visibleSeries = $.derived(() => context().series.visibleSeries);
			const visibleKeys = $.derived(() => new Set($.get(visibleSeries).map((s) => s.key)));
			const visibleItems = $.derived(() => data.filter((d) => $.get(visibleKeys).has(d.category)));
			const baselineY = $.derived(() => context().height);

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let dodged = () => ($$arg0?.()).items;
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							$.each(node, 17, dodged, ({ data: item, x, y, index }) => index, ($$anchor, $$item) => {
								let item = () => $.get($$item).data;
								let x = () => $.get($$item).x;
								let y = () => $.get($$item).y;
								let index = () => $.get($$item).index;
								const series = $.derived(() => $.get(visibleSeries).find((s) => s.key === item().category));
								const opacity = $.derived(() => context().series.isHighlighted(item().category, true) ? 1 : 0.2);
								const labelY = $.derived(() => y() - 6);
								var fragment_4 = root();
								var node_1 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => $.get(baselineY) - 4);
									let $1 = $.derived(() => $.get(labelY) + 6);
									let $2 = $.derived(() => 0.25 * $.get(opacity));

									Line(node_1, {
										get x1() {
											return x();
										},

										get x2() {
											return x();
										},

										get y1() {
											return $.get($0);
										},

										get y2() {
											return $.get($1);
										},

										get opacity() {
											return $.get($2);
										}
									});
								}

								var node_2 = $.sibling(node_1, 2);

								{
									let $0 = $.derived(() => $.get(series)?.color);

									Circle(node_2, {
										get cx() {
											return x();
										},

										get cy() {
											return $.get(baselineY);
										},
										r: 3,
										get fill() {
											return $.get($0);
										},

										get opacity() {
											return $.get(opacity);
										},
										class: 'stroke-surface-100'
									});
								}

								var node_3 = $.sibling(node_2, 2);

								{
									let $0 = $.derived(() => $.get(series)?.color);

									Text(node_3, {
										get x() {
											return x();
										},

										get y() {
											return $.get(labelY);
										},

										get value() {
											return item().label;
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										get fill() {
											return $.get($0);
										},

										get opacity() {
											return $.get(opacity);
										},
										class: 'text-[11px]'
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						};

						Dodge($$anchor, {
							get data() {
								return $.get(visibleItems);
							},
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
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
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

	return $.pop($$exports);
}