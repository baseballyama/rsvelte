import * as $ from 'svelte/internal/server';
import { Chart, Spline, Layer } from 'layerchart';
import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Spline_w_thicker_stroke($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			show: true,
			tweened: true,
			markerStart: true,
			markerMid: false,
			markerEnd: true,
			pathGenerator: (x) => x,
			curve: undefined,
			pointCount: 10,
			amplitude: 1,
			frequency: 10,
			phase: 0
		};

		const markerTypes = [
			'arrow',
			'triangle',
			'dot',
			'circle',
			'circle-stroke',
			'line'
		];

		const motion = $.derived(() => config.tweened ? 'tween' : 'none');

		const data = $.derived(() => Array.from({ length: config.pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: config.pathGenerator(i / config.pointCount) ?? i
			};
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MarkerControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(markerTypes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let marker = each_array[$$index];

				$$renderer.push(`<div>${$.escape(marker)}</div> `);

				Chart($$renderer, {
					data: data(),
					x: 'x',
					y: 'y',
					height: 100,
					children: ($$renderer) => {
						Layer($$renderer, {
							children: ($$renderer) => {
								if (config.show) {
									$$renderer.push('<!--[0-->');

									Spline($$renderer, {
										curve: config.curve,
										class: 'stroke-primary stroke-2',
										markerStart: config.markerStart ? { type: marker, 'stroke-width': 6 } : undefined,
										markerMid: config.markerMid ? { type: marker, 'stroke-width': 6 } : undefined,
										markerEnd: config.markerEnd ? { type: marker, 'stroke-width': 6 } : undefined,
										motion: motion()
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}