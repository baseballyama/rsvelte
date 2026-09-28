import * as $ from 'svelte/internal/server';
import { Arc, Chart, Layer, Text } from 'layerchart';
import { SpringValue } from 'svelte-ux';
import ArcControls from '$lib/components/controls/ArcControls.svelte';
import { cls } from '@layerstack/tailwind';

export default function Segmented_arc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 75;
		let segments = 60;
		const data = { value, segments };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ArcControls($$renderer, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				get segments() {
					return segments;
				},

				set segments($$value) {
					segments = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				height: 240,
				padding: 20,
				children: ($$renderer) => {
					Layer($$renderer, {
						center: true,
						children: ($$renderer) => {
							SpringValue($$renderer, {
								value,
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { value }) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like({ length: segments });

										for (let segmentIndex = 0, $$length = each_array.length; segmentIndex < $$length; segmentIndex++) {
											let _ = each_array[segmentIndex];
											const segmentAngle = 2 * Math.PI / segments;

											Arc($$renderer, {
												startAngle: segmentIndex * segmentAngle,
												endAngle: (segmentIndex + 1) * segmentAngle,
												innerRadius: -20,
												cornerRadius: 4,
												padAngle: 0.02,
												class: cls(segmentIndex / segments * 100 < (value ?? 0) ? 'fill-success-300' : 'fill-surface-content/10')
											});
										}

										$$renderer.push(`<!--]--> `);

										Text($$renderer, {
											value: Math.round(value ?? 0),
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											dy: 16,
											class: 'text-6xl tabular-nums'
										});

										$$renderer.push(`<!---->`);
									}
								}
							});
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