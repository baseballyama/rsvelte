import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Group, Layer, Rect, Text } from 'layerchart';
import { Treemap } from 'layerchart/hierarchy';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { hierarchy } from 'd3-hierarchy';

var root = $.from_html(`<!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const data = hierarchy({
		name: 'root',
		children: [
			{ name: 'A', value: 1000 },
			{ name: 'B', value: 900 },
			{ name: 'C', value: 800 },
			{ name: 'D', value: 700 },
			{ name: 'E', value: 600 },
			{ name: 'F', value: 500 },
			{ name: 'G', value: 400 },
			{ name: 'H', value: 300 },
			{ name: 'I', value: 200 },
			{ name: 'J', value: 100 },
			{ name: 'K', value: 100 }
		]
	}).sum((d) => {
		// @ts-expect-error
		return d.value;
	});

	const simpleOrdinalColor = scaleOrdinal(schemeSpectral[11].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
	);
	var $$exports = { data };

	Chart($$anchor, {
		height: 400,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, () => nodes().filter((n) => n.depth > 0), $.index, ($$anchor, node) => {
								Group($$anchor, {
									get x() {
										return $.get(node).x0;
									},

									get y() {
										return $.get(node).y0;
									},

									children: ($$anchor, $$slotProps) => {
										const nodeWidth = $.derived(() => $.get(node).x1 - $.get(node).x0);
										const nodeHeight = $.derived(() => $.get(node).y1 - $.get(node).y0);
										var fragment_5 = root();
										var node_2 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => simpleOrdinalColor($.get(node).data.name));

											Rect(node_2, {
												get width() {
													return $.get(nodeWidth);
												},

												get height() {
													return $.get(nodeHeight);
												},
												stroke: 'rgb(0, 0, 0, 0.2)',
												get fill() {
													return $.get($0);
												}
											});
										}

										var node_3 = $.sibling(node_2, 2);

										{
											let $0 = $.derived(() => $.get(nodeWidth) / 2);
											let $1 = $.derived(() => $.get(nodeHeight) / 2);

											Text(node_3, {
												get x() {
													return $.get($0);
												},

												get y() {
													return $.get($1);
												},

												get value() {
													return $.get(node).data.name;
												},
												fill: 'rgb(0, 0, 0, 0.8)',
												textAnchor: 'middle',
												verticalAnchor: 'middle'
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						Treemap($$anchor, {
							get hierarchy() {
								return data;
							},
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}