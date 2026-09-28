import * as $ from 'svelte/internal/server';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

export default function Domain_nice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = getSpiral({
			angle: 137.5,
			radius: 10,
			count: 100,
			width: 500,
			height: 500
		});

		let applyNice = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<label class="flex gap-2 pb-4 screenshot-hidden">`);

			Switch($$renderer, {
				get checked() {
					return applyNice;
				},

				set checked($$value) {
					applyNice = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(applyNice ? 'Applying Nice' : 'Not applying Nice')}</label> `);

			ScatterChart($$renderer, {
				data,
				x: 'x',
				y: 'y',
				xNice: applyNice,
				yNice: applyNice,
				padding: 24,
				height: 400
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