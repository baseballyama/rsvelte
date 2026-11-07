import * as $ from 'svelte/internal/server';
import { Chart, Layer, LinearGradient, Rect } from 'layerchart';

export default function Units($$renderer) {
	$$renderer.push(`<div class="overflow-x-auto max-w-full">`);

	Chart($$renderer, {
		height: 320,
		width: 700,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like({ length: 6 });

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _ = each_array[i];

								Rect($$renderer, {
									x: 0 + i * 120,
									y: 0,
									width: 100,
									height: 140,
									rx: 8,
									fill: gradient
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						LinearGradient($$renderer, {
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

								Rect($$renderer, {
									x: 0 + i * 120,
									y: 160,
									width: 100,
									height: 140,
									rx: 8,
									fill: gradient
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						LinearGradient($$renderer, {
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

	$$renderer.push(`<!----></div>`);
}