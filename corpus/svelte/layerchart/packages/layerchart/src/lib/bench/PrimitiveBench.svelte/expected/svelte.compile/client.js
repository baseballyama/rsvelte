import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../components/Chart/Chart.svelte';
import Layer from '../components/layers/Layer.svelte';
import Rect from '../components/Rect/Rect.svelte';
import Circle from '../components/Circle/Circle.svelte';
import Ellipse from '../components/Ellipse/Ellipse.svelte';
import Line from '../components/Line/Line.svelte';
import Group from '../components/Group/Group.svelte';
import Text from '../components/Text/Text.svelte';
import Path from '../components/Path/Path.svelte';
import RectSvg from '../components/Rect/Rect.svg.svelte';
import TextSvg from '../components/Text/Text.svg.svelte';

var root = $.from_svg(`<rect fill="steelblue"></rect>`);
var root_1 = $.from_svg(`<text fill="steelblue">Hello</text>`);
var root_2 = $.from_svg(`<circle fill="steelblue"></circle>`);
var root_3 = $.from_svg(`<ellipse fill="steelblue"></ellipse>`);
var root_4 = $.from_svg(`<line stroke="steelblue"></line>`);
var root_5 = $.from_svg(`<g transform="translate(10,10)"></g>`);
var root_6 = $.from_svg(`<path d="M0,0 L50,50 L100,0 Z" fill="none" stroke="steelblue"></path>`);
var root_7 = $.from_svg(`<svg></svg>`);

export default function PrimitiveBench($$anchor, $$props) {
	// Layer-specific variants, as re-exported by `layerchart/svg`. These skip
	// the dispatcher that reads the layer context — see `mode: 'direct'`.
	/**
	 * - `native` — bare `<svg>`, no Chart at all
	 * - `native-in-chart` — native elements inside Chart + Layer (isolates fixed setup)
	 * - `direct` — layer-specific component, as exported by `layerchart/svg`
	 * - `layerchart` — the dispatcher, as exported by `layerchart`
	 *
	 * `native-in-chart` and `direct` are only wired up for the primitives used by
	 * the overhead-decomposition benchmark.
	 */
	let count = $.prop($$props, 'count', 3, 100);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_7 = ($$anchor) => {
			Chart($$anchor, {
				width: 500,
				height: 300,
				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						type: 'svg',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, () => Array(count()), $.index, ($$anchor, _) => {
								var fragment_4 = $.comment();
								var node_2 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										Rect($$anchor, { x: 10, y: 10, width: 50, height: 30, fill: 'steelblue' });
									};

									var consequent_1 = ($$anchor) => {
										Circle($$anchor, { cx: 30, cy: 30, r: 15, fill: 'steelblue' });
									};

									var consequent_2 = ($$anchor) => {
										Ellipse($$anchor, { cx: 30, cy: 30, rx: 20, ry: 10, fill: 'steelblue' });
									};

									var consequent_3 = ($$anchor) => {
										Line($$anchor, {
											x1: 0,
											y1: 0,
											x2: 50,
											y2: 50,
											stroke: 'steelblue',
											strokeWidth: 2
										});
									};

									var consequent_4 = ($$anchor) => {
										Group($$anchor, { x: 10, y: 10 });
									};

									var consequent_5 = ($$anchor) => {
										Text($$anchor, { x: 10, y: 20, value: 'Hello', fill: 'steelblue' });
									};

									var consequent_6 = ($$anchor) => {
										Path($$anchor, {
											pathData: 'M0,0 L50,50 L100,0 Z',
											fill: 'none',
											stroke: 'steelblue',
											strokeWidth: 2
										});
									};

									$.if(node_2, ($$render) => {
										if ($$props.primitive === 'rect') $$render(consequent); else if ($$props.primitive === 'circle') $$render(consequent_1, 1); else if ($$props.primitive === 'ellipse') $$render(consequent_2, 2); else if ($$props.primitive === 'line') $$render(consequent_3, 3); else if ($$props.primitive === 'group') $$render(consequent_4, 4); else if ($$props.primitive === 'text') $$render(consequent_5, 5); else if ($$props.primitive === 'path') $$render(consequent_6, 6);
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var consequent_10 = ($$anchor) => {
			Chart($$anchor, {
				width: 500,
				height: 300,
				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						type: 'svg',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = $.comment();
							var node_3 = $.first_child(fragment_14);

							$.each(node_3, 17, () => Array(count()), $.index, ($$anchor, _) => {
								var fragment_15 = $.comment();
								var node_4 = $.first_child(fragment_15);

								{
									var consequent_8 = ($$anchor) => {
										RectSvg($$anchor, { x: 10, y: 10, width: 50, height: 30, fill: 'steelblue' });
									};

									var consequent_9 = ($$anchor) => {
										TextSvg($$anchor, { x: 10, y: 20, value: 'Hello', fill: 'steelblue' });
									};

									$.if(node_4, ($$render) => {
										if ($$props.primitive === 'rect') $$render(consequent_8); else if ($$props.primitive === 'text') $$render(consequent_9, 1);
									});
								}

								$.append($$anchor, fragment_15);
							});

							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var consequent_13 = ($$anchor) => {
			Chart($$anchor, {
				width: 500,
				height: 300,
				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						type: 'svg',
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = $.comment();
							var node_5 = $.first_child(fragment_20);

							$.each(node_5, 17, () => Array(count()), $.index, ($$anchor, _) => {
								var fragment_21 = $.comment();
								var node_6 = $.first_child(fragment_21);

								{
									var consequent_11 = ($$anchor) => {
										var rect = root();

										$.set_attribute(rect, 'x', 10);
										$.set_attribute(rect, 'y', 10);
										$.set_attribute(rect, 'width', 50);
										$.set_attribute(rect, 'height', 30);
										$.append($$anchor, rect);
									};

									var consequent_12 = ($$anchor) => {
										var text = root_1();

										$.set_attribute(text, 'x', 10);
										$.set_attribute(text, 'y', 20);
										$.append($$anchor, text);
									};

									$.if(node_6, ($$render) => {
										if ($$props.primitive === 'rect') $$render(consequent_11); else if ($$props.primitive === 'text') $$render(consequent_12, 1);
									});
								}

								$.append($$anchor, fragment_21);
							});

							$.append($$anchor, fragment_20);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var svg = root_7();

			$.set_attribute(svg, 'width', 500);
			$.set_attribute(svg, 'height', 300);

			$.each(svg, 21, () => Array(count()), $.index, ($$anchor, _) => {
				var fragment_22 = $.comment();
				var node_7 = $.first_child(fragment_22);

				{
					var consequent_14 = ($$anchor) => {
						var rect_1 = root();

						$.set_attribute(rect_1, 'x', 10);
						$.set_attribute(rect_1, 'y', 10);
						$.set_attribute(rect_1, 'width', 50);
						$.set_attribute(rect_1, 'height', 30);
						$.append($$anchor, rect_1);
					};

					var consequent_15 = ($$anchor) => {
						var circle = root_2();

						$.set_attribute(circle, 'cx', 30);
						$.set_attribute(circle, 'cy', 30);
						$.set_attribute(circle, 'r', 15);
						$.append($$anchor, circle);
					};

					var consequent_16 = ($$anchor) => {
						var ellipse = root_3();

						$.set_attribute(ellipse, 'cx', 30);
						$.set_attribute(ellipse, 'cy', 30);
						$.set_attribute(ellipse, 'rx', 20);
						$.set_attribute(ellipse, 'ry', 10);
						$.append($$anchor, ellipse);
					};

					var consequent_17 = ($$anchor) => {
						var line = root_4();

						$.set_attribute(line, 'x1', 0);
						$.set_attribute(line, 'y1', 0);
						$.set_attribute(line, 'x2', 50);
						$.set_attribute(line, 'y2', 50);
						$.set_attribute(line, 'stroke-width', 2);
						$.append($$anchor, line);
					};

					var consequent_18 = ($$anchor) => {
						var g = root_5();

						$.append($$anchor, g);
					};

					var consequent_19 = ($$anchor) => {
						var text_1 = root_1();

						$.set_attribute(text_1, 'x', 10);
						$.set_attribute(text_1, 'y', 20);
						$.append($$anchor, text_1);
					};

					var consequent_20 = ($$anchor) => {
						var path = root_6();

						$.set_attribute(path, 'stroke-width', 2);
						$.append($$anchor, path);
					};

					$.if(node_7, ($$render) => {
						if ($$props.primitive === 'rect') $$render(consequent_14); else if ($$props.primitive === 'circle') $$render(consequent_15, 1); else if ($$props.primitive === 'ellipse') $$render(consequent_16, 2); else if ($$props.primitive === 'line') $$render(consequent_17, 3); else if ($$props.primitive === 'group') $$render(consequent_18, 4); else if ($$props.primitive === 'text') $$render(consequent_19, 5); else if ($$props.primitive === 'path') $$render(consequent_20, 6);
					});
				}

				$.append($$anchor, fragment_22);
			});

			$.reset(svg);
			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if ($$props.mode === 'layerchart') $$render(consequent_7); else if ($$props.mode === 'direct') $$render(consequent_10, 1); else if ($$props.mode === 'native-in-chart') $$render(consequent_13, 2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}