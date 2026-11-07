import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sum } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';
import { Arc, Chart, Layer, Pie, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Labels_centroid_multiple($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const dataSum = $.derived(() => sum(data, (d) => d.value));

	const keyClasses = [
		{ shape: 'fill-info', content: 'fill-info-content' },
		{ shape: 'fill-success', content: 'fill-success-content' },
		{ shape: 'fill-warning', content: 'fill-warning-content' },
		{ shape: 'fill-danger', content: 'fill-danger-content' }
	];

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'value',
		c: 'date',
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let arcs = () => ($$arg0?.()).arcs;
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							$.each(node, 17, arcs, $.index, ($$anchor, arc, index) => {
								const colors = $.derived(() => keyClasses[index]);

								{
									const children = ($$anchor, $$arg0) => {
										let getArcTextProps = () => ($$arg0?.()).getArcTextProps;
										const textProps = $.derived(() => getArcTextProps()('centroid'));
										var fragment_5 = root();
										var node_1 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => format($.get(arc).data.value / $.get(dataSum), 'percent'));
											let $1 = $.derived(() => cls('text-base', $.get(colors).content));

											Text(node_1, $.spread_props(
												{
													get value() {
														return $.get($0);
													}
												},
												() => $.get(textProps),
												{
													dy: -8,
													get class() {
														return $.get($1);
													}
												}
											));
										}

										var node_2 = $.sibling(node_1, 2);

										{
											let $0 = $.derived(() => cls('text-sm opacity-50', $.get(colors).content));

											Text(node_2, $.spread_props(
												{
													get value() {
														return $.get(arc).data.value;
													}
												},
												() => $.get(textProps),
												{
													dy: 8,
													get class() {
														return $.get($0);
													}
												}
											));
										}

										$.append($$anchor, fragment_5);
									};

									Arc($$anchor, {
										get startAngle() {
											return $.get(arc).startAngle;
										},

										get endAngle() {
											return $.get(arc).endAngle;
										},

										get padAngle() {
											return $.get(arc).padAngle;
										},

										get class() {
											return $.get(colors).shape;
										},
										children,
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						Pie($$anchor, { children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}