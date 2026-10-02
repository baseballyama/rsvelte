import * as $ from 'svelte/internal/server';
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

export default function PrimitiveBench($$renderer, $$props) {
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
	let { primitive, mode, count = 100 } = $$props;

	if (mode === 'layerchart') {
		$$renderer.push('<!--[0-->');

		Chart($$renderer, {
			width: 500,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					type: 'svg',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(Array(count));

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _ = each_array[i];

							if (primitive === 'rect') {
								$$renderer.push('<!--[0-->');
								Rect($$renderer, { x: 10, y: 10, width: 50, height: 30, fill: 'steelblue' });
							} else if (primitive === 'circle') {
								$$renderer.push('<!--[1-->');
								Circle($$renderer, { cx: 30, cy: 30, r: 15, fill: 'steelblue' });
							} else if (primitive === 'ellipse') {
								$$renderer.push('<!--[2-->');
								Ellipse($$renderer, { cx: 30, cy: 30, rx: 20, ry: 10, fill: 'steelblue' });
							} else if (primitive === 'line') {
								$$renderer.push('<!--[3-->');

								Line($$renderer, {
									x1: 0,
									y1: 0,
									x2: 50,
									y2: 50,
									stroke: 'steelblue',
									strokeWidth: 2
								});
							} else if (primitive === 'group') {
								$$renderer.push('<!--[4-->');
								Group($$renderer, { x: 10, y: 10 });
							} else if (primitive === 'text') {
								$$renderer.push('<!--[5-->');
								Text($$renderer, { x: 10, y: 20, value: 'Hello', fill: 'steelblue' });
							} else if (primitive === 'path') {
								$$renderer.push('<!--[6-->');

								Path($$renderer, {
									pathData: 'M0,0 L50,50 L100,0 Z',
									fill: 'none',
									stroke: 'steelblue',
									strokeWidth: 2
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	} else if (mode === 'direct') {
		$$renderer.push('<!--[1-->');

		Chart($$renderer, {
			width: 500,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					type: 'svg',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(Array(count));

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let _ = each_array_1[i];

							if (primitive === 'rect') {
								$$renderer.push('<!--[0-->');
								RectSvg($$renderer, { x: 10, y: 10, width: 50, height: 30, fill: 'steelblue' });
							} else if (primitive === 'text') {
								$$renderer.push('<!--[1-->');
								TextSvg($$renderer, { x: 10, y: 20, value: 'Hello', fill: 'steelblue' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	} else if (mode === 'native-in-chart') {
		$$renderer.push('<!--[2-->');

		Chart($$renderer, {
			width: 500,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					type: 'svg',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_2 = $.ensure_array_like(Array(count));

						for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
							let _ = each_array_2[i];

							if (primitive === 'rect') {
								$$renderer.push(`<!--[0--><rect${$.attr('x', 10)}${$.attr('y', 10)}${$.attr('width', 50)}${$.attr('height', 30)} fill="steelblue"></rect>`);
							} else if (primitive === 'text') {
								$$renderer.push(`<!--[1--><text${$.attr('x', 10)}${$.attr('y', 20)} fill="steelblue">Hello</text>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push(`<!--[-1--><svg${$.attr('width', 500)}${$.attr('height', 300)}><!--[-->`);

		const each_array_3 = $.ensure_array_like(Array(count));

		for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
			let _ = each_array_3[i];

			if (primitive === 'rect') {
				$$renderer.push(`<!--[0--><rect${$.attr('x', 10)}${$.attr('y', 10)}${$.attr('width', 50)}${$.attr('height', 30)} fill="steelblue"></rect>`);
			} else if (primitive === 'circle') {
				$$renderer.push(`<!--[1--><circle${$.attr('cx', 30)}${$.attr('cy', 30)}${$.attr('r', 15)} fill="steelblue"></circle>`);
			} else if (primitive === 'ellipse') {
				$$renderer.push(`<!--[2--><ellipse${$.attr('cx', 30)}${$.attr('cy', 30)}${$.attr('rx', 20)}${$.attr('ry', 10)} fill="steelblue"></ellipse>`);
			} else if (primitive === 'line') {
				$$renderer.push(`<!--[3--><line${$.attr('x1', 0)}${$.attr('y1', 0)}${$.attr('x2', 50)}${$.attr('y2', 50)} stroke="steelblue"${$.attr('stroke-width', 2)}></line>`);
			} else if (primitive === 'group') {
				$$renderer.push(`<!--[4--><g transform="translate(10,10)"></g>`);
			} else if (primitive === 'text') {
				$$renderer.push(`<!--[5--><text${$.attr('x', 10)}${$.attr('y', 20)} fill="steelblue">Hello</text>`);
			} else if (primitive === 'path') {
				$$renderer.push(`<!--[6--><path d="M0,0 L50,50 L100,0 Z" fill="none" stroke="steelblue"${$.attr('stroke-width', 2)}></path>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></svg>`);
	}

	$$renderer.push(`<!--]-->`);
}