import 'svelte/internal/disclose-version';
import { getSvelteMilestones } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { ascending } from 'd3-array';
import { Chart, Circle, Dodge, Line, Text } from 'layerchart';

const milestones = await getSvelteMilestones();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Timeline_bidirectional($$anchor, $$props) {
	$.push($$props, true);

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

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const visibleSeries = $.derived(() => context().series.visibleSeries);
			const visibleKeys = $.derived(() => new Set($.get(visibleSeries).map((s) => s.key)));
			const visibleData = $.derived(() => data.filter((d) => $.get(visibleKeys).has(d.category)));
			const baselineY = $.derived(() => context().height / 2);
			const above = $.derived(() => $.get(visibleData).filter((d) => d.side === 'above'));
			const below = $.derived(() => $.get(visibleData).filter((d) => d.side === 'below'));
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Line(node, {
				x1: 0,
				get x2() {
					return context().width;
				},

				get y1() {
					return $.get(baselineY);
				},

				get y2() {
					return $.get(baselineY);
				},
				class: 'stroke-surface-content/40'
			});

			var node_1 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let dodged = () => ($$arg0?.()).items;
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.each(node_2, 17, dodged, ({ data: item, x, y, index }) => index, ($$anchor, $$item, $$index, $$array) => {
						let item = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let index = () => $.get($$item).index;
						const series = $.derived(() => $.get(visibleSeries).find((s) => s.key === item().category));
						const opacity = $.derived(() => context().series.isHighlighted(item().category, true) ? 1 : 0.2);
						const labelY = $.derived(() => y() - 6);
						var fragment_3 = root();
						var node_3 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => $.get(baselineY) - 4);
							let $1 = $.derived(() => $.get(labelY) + 6);
							let $2 = $.derived(() => 0.25 * $.get(opacity));

							Line(node_3, {
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

						var node_4 = $.sibling(node_3, 2);

						{
							let $0 = $.derived(() => $.get(series)?.color);

							Circle(node_4, {
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

						var node_5 = $.sibling(node_4, 2);

						{
							let $0 = $.derived(() => $.get(series)?.color);

							Text(node_5, {
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

						$.append($$anchor, fragment_3);
					});

					$.append($$anchor, fragment_2);
				};

				Dodge(node_1, {
					get data() {
						return $.get(above);
					},
					axis: 'y',
					anchor: 'bottom',
					get baseline() {
						return $.get(baselineY);
					},
					padding: 4,
					rx: (d) => labelHalfWidth(d.label),
					ry: 8,
					children,
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let dodged = () => ($$arg0?.()).items;
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					$.each(node_7, 17, dodged, ({ data: item, x, y, index }) => index, ($$anchor, $$item, $$index_1, $$array_1) => {
						let item = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let index = () => $.get($$item).index;
						const series = $.derived(() => $.get(visibleSeries).find((s) => s.key === item().category));
						const opacity = $.derived(() => context().series.isHighlighted(item().category, true) ? 1 : 0.2);
						const labelY = $.derived(() => y() + 6);
						var fragment_5 = root();
						var node_8 = $.first_child(fragment_5);

						{
							let $0 = $.derived(() => $.get(baselineY) + 4);
							let $1 = $.derived(() => $.get(labelY) - 6);
							let $2 = $.derived(() => 0.25 * $.get(opacity));

							Line(node_8, {
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

						var node_9 = $.sibling(node_8, 2);

						{
							let $0 = $.derived(() => $.get(series)?.color);

							Circle(node_9, {
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

						var node_10 = $.sibling(node_9, 2);

						{
							let $0 = $.derived(() => $.get(series)?.color);

							Text(node_10, {
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

						$.append($$anchor, fragment_5);
					});

					$.append($$anchor, fragment_4);
				};

				Dodge(node_6, {
					get data() {
						return $.get(below);
					},
					axis: 'y',
					anchor: 'top',
					get baseline() {
						return $.get(baselineY);
					},
					padding: 4,
					rx: (d) => labelHalfWidth(d.label),
					ry: 8,
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get series() {
				return series;
			},
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

	return $.pop($$exports);
}