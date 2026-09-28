import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { Chart, Circle, Layer, Points, Spline } from 'layerchart';
import TransformContextPlaygroundControls from '$lib/components/controls/TransformContextPlaygroundControls.svelte';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { getSpiral } from '$lib/utils/data';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			pointCount: 500,
			angle: 137.5,
			showPoints: true,
			showPath: false,
			tweened: true,
			curve: undefined
		};

		const data = $.derived(() => getSpiral({
			angle: config.angle,
			radius: 10,
			count: config.pointCount,
			width: 500,
			height: 500
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TransformContextPlaygroundControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid place-items-center">`);

			Chart($$renderer, {
				data: data(),
				x: 'x',
				y: 'y',
				transform: {
					mode: 'canvas',
					motion: config.tweened
						? { type: 'tween', duration: 800, easing: cubicOut }
						: undefined,
					scrollMode: 'scale'
				},
				clip: true,
				padding: 50,
				width: 500,
				height: 500,
				children: ($$renderer) => {
					TransformContextControls($$renderer, {});
					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							if (config.showPath) {
								$$renderer.push('<!--[0-->');
								Spline($$renderer, { curve: config.curve, motion: 'tween' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (config.showPoints) {
								$$renderer.push('<!--[0-->');

								{
									function children($$renderer, { points }) {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(points);

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let point = each_array[index];

											Circle($$renderer, {
												cx: point.x,
												cy: point.y,
												r: 2,
												class: index % 2 ? 'fill-primary' : 'fill-secondary',
												motion: config.tweened ? 'tween' : undefined
											});
										}

										$$renderer.push(`<!--]-->`);
									}

									Points($$renderer, { children, $$slots: { default: true } });
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}