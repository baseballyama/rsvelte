import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';
import { longData } from '$lib/utils/data';

export default function Legend_programmatic_control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		const slices = [
			{ key: 'apples', color: 'var(--color-apples)' },
			{ key: 'bananas', color: 'var(--color-bananas)' },
			{ key: 'cherries', color: 'var(--color-cherries)' },
			{ key: 'grapes', color: 'var(--color-grapes)' }
		];

		let context = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-1 mb-2 items-center flex-wrap"><!--[-->`);

			const each_array = $.ensure_array_like(slices);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let s = each_array[$$index];
				const isVisible = context?.series.isVisible(s.key) ?? true;

				Button($$renderer, {
					variant: 'outline',
					size: 'sm',
					rounded: 'full',
					style: `--border-color: ${$.stringify(s.color)}; ${isVisible
						? `--bg-color: ${s.color}; --text-color: white`
						: `--text-color: ${s.color}`}`,
					onclick: () => context?.series.selectedKeys.toggle(s.key),
					onpointerenter: () => {
						if (context && isVisible) context.series.highlightKey = s.key;
					},

					onpointerleave: () => {
						if (context) context.series.highlightKey = null;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(s.key)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				class: 'ml-auto',
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => context?.series.selectedKeys.clear(),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Show All`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			PieChart($$renderer, {
				data,
				key: 'fruit',
				value: 'value',
				cRange: slices.map((s) => s.color),
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