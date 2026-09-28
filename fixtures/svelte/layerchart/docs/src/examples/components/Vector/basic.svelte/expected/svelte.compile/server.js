import * as $ from 'svelte/internal/server';
import { Chart, Vector, Layer } from 'layerchart';

export default function Basic($$renderer) {
	function circle(centerX, centerY, rotate) {
		return Array.from({ length: 12 }, (_, i) => {
			const angle = i * 30;
			const rad = angle * Math.PI / 180;

			return {
				cx: centerX + Math.sin(rad) * 60,
				cy: centerY - Math.cos(rad) * 60,
				rotate: rotate(angle)
			};
		});
	}

	const outward = circle(120, 150, (a) => a);
	const inward = circle(320, 150, (a) => a + 180);

	Chart($$renderer, {
		padding: { top: 10, bottom: 10, left: 10, right: 10 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(outward);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let v = each_array[$$index];

						Vector($$renderer, {
							x: v.cx,
							y: v.cy,
							length: 30,
							width: 5,
							rotate: v.rotate,
							class: 'stroke-primary'
						});
					}

					$$renderer.push(`<!--]--> <!--[-->`);

					const each_array_1 = $.ensure_array_like(inward);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let v = each_array_1[$$index_1];

						Vector($$renderer, {
							x: v.cx,
							y: v.cy,
							length: 30,
							width: 5,
							rotate: v.rotate,
							class: 'stroke-danger'
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