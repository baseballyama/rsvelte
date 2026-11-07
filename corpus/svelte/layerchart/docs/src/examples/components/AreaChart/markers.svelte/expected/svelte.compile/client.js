import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, Circle, defaultChartPadding, Layer, Line } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { Button } from 'svelte-ux';
import { Blockquote } from '@layerstack/docs/markdown/components';

var root = $.from_html(`<!> <!>`, 1);

export default function Markers($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	let markerPoints = $.state($.proxy([]));
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $.get(markerPoints), $.index, ($$anchor, p) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => context().xScale($.get(p).date));
					let $1 = $.derived(() => context().xScale($.get(p).date));
					let $2 = $.derived(() => context().yScale($.get(p).value));

					Line(node_2, {
						get x1() {
							return $.get($0);
						},

						get y1() {
							return context().height;
						},

						get x2() {
							return $.get($1);
						},

						get y2() {
							return $.get($2);
						},
						stroke: 'var(--color-surface-content)',
						strokeOpacity: 0.5,
						strokeWidth: 2,
						dashArray: [4, 4]
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => context().xScale($.get(p).date));
					let $1 = $.derived(() => context().yScale($.get(p).value));

					Circle(node_3, {
						get cx() {
							return $.get($0);
						},

						get cy() {
							return $.get($1);
						},
						r: 4,
						class: 'fill-primary stroke-4 stroke-primary/50'
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		const aboveContext = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				type: 'html',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					$.each(node_4, 17, () => $.get(markerPoints), $.index, ($$anchor, p) => {
						{
							let $0 = $.derived(() => context().height + 2);
							let $1 = $.derived(() => context().xScale($.get(p).date));

							Button($$anchor, {
								class: 'absolute translate-x-[-50%] text-[10px] bg-surface-100 border border-primary',
								get style() {
									return `top: ${$.get($0) ?? ''}px; left: ${$.get($1) ?? ''}px`;
								},
								size: 'sm',
								$$events: {
									click: (e) => {
										e.stopPropagation();
										$.set(markerPoints, $.get(markerPoints).filter((p2) => $.get(p) !== p2), true);
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Remove');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		AreaChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			onTooltipClick: (e, detail) => {
				if ($.get(markerPoints).includes(detail.data)) {
					$.set(markerPoints, $.get(markerPoints).filter((d) => d !== detail.data), true);
				} else {
					$.set(markerPoints, [...$.get(markerPoints), detail.data], true);
				}
			},

			get padding() {
				return $.get($0);
			},
			height: 300,
			aboveMarks,
			aboveContext,
			$$slots: { aboveMarks: true, aboveContext: true }
		});
	}

	var node_5 = $.sibling(node, 2);

	Blockquote(node_5, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Click to add/remove markers');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}