import * as $ from 'svelte/internal/server';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

export default function Tailwind_colors($$renderer) {
	const radius = 50;

	Chart($$renderer, {
		height: 220,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					RadialGradient($$renderer, { id: 'tw-1', class: 'from-pink-500 to-yellow-500' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-2', class: 'from-green-300 to-purple-600' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-3', class: 'from-gray-600 to-black' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-4', class: 'from-pink-300 to-indigo-400' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-5', class: 'from-yellow-100 to-yellow-500' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-6', class: 'from-blue-700 to-gray-900' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-7', class: 'from-sky-300 to-blue-500' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-8', class: 'from-red-500 to-red-800' });
					$$renderer.push(`<!----> `);
					RadialGradient($$renderer, { id: 'tw-9', class: 'from-blue-400 to-emerald-400' });
					$$renderer.push(`<!----> <!--[-->`);

					const each_array = $.ensure_array_like({ length: 9 });

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let _ = each_array[i];

						Circle($$renderer, {
							cx: radius + 120 * (i % 5),
							cy: radius + 120 * Math.floor(i / 5),
							r: radius,
							fill: `url(#tw-${$.stringify(i + 1)})`
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}