import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Points, Layer } from 'layerchart';
import AreaPlaygroundControls from '$lib/components/controls/AreaPlaygroundControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			pathGenerator: (x) => x,
			curve: undefined,
			pointCount: 10,
			showPoints: false,
			showLine: true,
			show: true,
			tweened: true
		};

		const motion = $.derived(() => config.tweened ? 'tween' : 'none');

		const data = $.derived(() => Array.from({ length: config.pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: config.pathGenerator?.(i / config.pointCount) ?? i
			};
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AreaPlaygroundControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data: data(),
				x: 'x',
				y: 'y',
				yNice: true,
				padding: 20,
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							if (config.show) {
								$$renderer.push('<!--[0-->');

								Area($$renderer, {
									curve: config.curve,
									line: config.showLine && { class: 'stroke-primary stroke-2' },
									motion: motion(),
									class: 'fill-primary/10'
								});

								$$renderer.push(`<!----> `);

								if (config.showPoints) {
									$$renderer.push('<!--[0-->');

									Points($$renderer, {
										motion: motion(),
										r: 3,
										class: 'fill-surface-100 stroke-primary'
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}