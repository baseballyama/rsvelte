import * as $ from 'svelte/internal/server';
import { Chart, Layer, LinearGradient, Rect } from 'layerchart';

export default function Tailwind_colors($$renderer) {
	$$renderer.push(`<div class="overflow-x-auto max-w-full">`);

	Chart($$renderer, {
		height: 320,
		width: 1065,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-pink-500 to-yellow-500',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-green-300 to-purple-600',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-gray-600 to-black',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 3,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-pink-300 to-indigo-400',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 4,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-yellow-100 to-yellow-500',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 5,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-blue-700 to-gray-900',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 6,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-sky-300 to-blue-500',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 7,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-red-500 to-red-800',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 8,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							class: 'from-blue-400 to-emerald-400',
							vertical: true,
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