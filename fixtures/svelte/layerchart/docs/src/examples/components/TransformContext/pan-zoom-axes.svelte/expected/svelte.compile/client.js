import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Axis, Rect, LinearGradient, ChartClipPath } from 'layerchart';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { quantize } from 'd3-interpolate';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Pan_zoom_axes($$anchor, $$props) {
	$.push($$props, true);

	const domainSize = 500;
	const stops = quantize((t) => interpolateSpectral(1 - t), 9);
	const data = [{ x: 0, y: 0 }, { x: domainSize, y: domainSize }];
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			TransformControls(node, {});

			var node_1 = $.sibling(node, 2);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							{
								let $0 = $.derived(() => context().xScale(0));
								let $1 = $.derived(() => context().yScale(0));
								let $2 = $.derived(() => context().xScale(domainSize) - context().xScale(0));
								let $3 = $.derived(() => context().yScale(domainSize) - context().yScale(0));

								Rect($$anchor, {
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									},

									get width() {
										return $.get($2);
									},

									get height() {
										return $.get($3);
									},

									get fill() {
										return gradient();
									}
								});
							}
						};

						LinearGradient(node_2, {
							x1: '0%',
							y1: '0%',
							x2: '100%',
							y2: '100%',
							get stops() {
								return stops;
							},
							children,
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, {
						placement: 'top',
						grid: { class: 'mix-blend-difference' },
						rule: false,
						tickMarks: false,
						tickLabelProps: { verticalAnchor: 'start', dy: 4, class: 'text-current' }
					});

					var node_4 = $.sibling(node_3, 2);

					Axis(node_4, {
						placement: 'left',
						grid: { class: 'mix-blend-difference' },
						rule: false,
						tickMarks: false,
						tickLabelProps: { textAnchor: 'start', dx: 4, class: 'text-current' }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'x',
			y: 'y',
			xDomain: [0, domainSize],
			yDomain: [domainSize, 0],
			transform: {
				mode: 'domain',
				scaleExtent: [1, 40],
				motion: { type: 'spring' }
			},
			height: 500,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}