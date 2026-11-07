import * as $ from 'svelte/internal/server';
import { Chart, Waffle } from 'layerchart';
import { RangeField } from 'svelte-ux';

export default function Auto_multiple($$renderer) {
	let apples = 500;
	const data = $.derived(() => [{ label: 'apples', count: apples }]);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="mb-4 screenshot-hidden">`);

		RangeField($$renderer, {
			label: 'Apples',
			min: 10,
			max: 1000,
			dense: true,
			get value() {
				return apples;
			},

			set value($$value) {
				apples = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> `);

		{
			function marks($$renderer) {
				Waffle($$renderer, { axis: 'x', fill: 'var(--color-primary)' });
			}

			Chart($$renderer, {
				data: data(),
				x: 'count',
				xDomain: [0, null],
				xNice: true,
				y: 'label',
				padding: { left: 48, bottom: 24, right: 8 },
				height: 180,
				marks,
				$$slots: { marks: true }
			});
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}