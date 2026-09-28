import * as $ from 'svelte/internal/server';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

export default function Units($$renderer) {
	const radius = 50;

	Chart($$renderer, {
		height: 220,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like({ length: 6 });

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _ = each_array[i];

								Circle($$renderer, { cx: radius + i * 120, cy: radius, r: radius, fill: gradient });
							}

							$$renderer.push(`<!--]-->`);
						}

						RadialGradient($$renderer, {
							class: 'from-green-500 to-blue-500',
							units: 'objectBoundingBox',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like({ length: 6 });

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let _ = each_array_1[i];

								Circle($$renderer, {
									cx: radius + i * 120,
									cy: 120 + radius,
									r: radius,
									fill: gradient
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						RadialGradient($$renderer, {
							class: 'from-green-500 to-blue-500',
							units: 'userSpaceOnUse',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}