import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_programmatic_control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		const series = [
			{ key: 'apples', color: 'var(--color-apples)' },
			{
				key: 'bananas',
				color: 'var(--color-bananas)',
				selected: false
			},
			{ key: 'oranges', color: 'var(--color-oranges)' }
		];

		let context = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-2 mb-2 items-center flex-wrap"><!--[-->`);

			const each_array = $.ensure_array_like(series);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let s = each_array[$$index];
				const isVisible = context?.series?.isVisible(s.key) ?? true;

				$$renderer.push(`<button class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all"${$.attr_style('', {
					'background-color': isVisible ? s.color : 'transparent',
					color: isVisible ? 'white' : 'var(--color-surface-content)',
					border: `2px solid ${$.stringify(s.color)}`,
					opacity: isVisible ? 1 : 0.4
				})}>${$.escape(s.key)}</button>`);
			}

			$$renderer.push(`<!--]--> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				class: 'ml-auto',
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => context?.series?.selectedKeys?.clear(),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Show All`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			LineChart($$renderer, {
				data,
				x: 'date',
				series,
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				}
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