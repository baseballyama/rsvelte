import * as $ from 'svelte/internal/server';
import { Chart, Vector, Circle, Axis, Layer } from 'layerchart';
import { RangeField } from 'svelte-ux';

export default function Anchor($$renderer) {
	let rotate = 45;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="mb-2 screenshot-hidden">`);

		RangeField($$renderer, {
			label: 'Rotate',
			min: 0,
			max: 360,
			step: 1,
			get value() {
				return rotate;
			},

			set value($$value) {
				rotate = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> `);

		Chart($$renderer, {
			xDomain: [0, 100],
			yDomain: [0, 100],
			padding: { top: 10, bottom: 20, left: 24, right: 10 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Circle($$renderer, { cx: 100, cy: 150, r: 3, class: 'fill-primary' });
						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 100,
							y: 150,
							length: 40,
							width: 5,
							rotate,
							anchor: 'start',
							class: 'stroke-primary'
						});

						$$renderer.push(`<!----> `);
						Circle($$renderer, { cx: 200, cy: 150, r: 3, class: 'fill-secondary' });
						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 200,
							y: 150,
							length: 40,
							width: 5,
							rotate,
							anchor: 'middle',
							class: 'stroke-secondary'
						});

						$$renderer.push(`<!----> `);
						Circle($$renderer, { cx: 300, cy: 150, r: 3, class: 'fill-danger' });
						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 300,
							y: 150,
							length: 40,
							width: 5,
							rotate,
							anchor: 'end',
							class: 'stroke-danger'
						});

						$$renderer.push(`<!---->`);
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
}