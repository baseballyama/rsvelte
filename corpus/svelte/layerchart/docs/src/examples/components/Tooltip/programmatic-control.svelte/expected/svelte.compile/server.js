import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { format } from '@layerstack/utils';
import { Button, ButtonGroup } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

export default function Programmatic_control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 400, max: 900, value: 'integer' });
		let context = void 0;
		const dates = data.map((d) => d.date);
		const tooltipData = $.derived(() => context?.tooltip.data);

		const activeIndex = $.derived(() => tooltipData()
			? dates.findIndex((d) => +d === +tooltipData().date)
			: -1);

		function step(delta) {
			// start at the beginning when nothing is shown
			const next = activeIndex() === -1 ? 0 : activeIndex() + delta;

			if (next < 0 || next >= dates.length) return;

			// `show({ value })` resolves the nearest point to a domain value, so anything that knows an
			// `x` can drive the tooltip — a button, a keypress, a selection made elsewhere
			context?.tooltip.show({ value: { x: dates[next] } });
		}

		// Built as a single string so the announced text has real separators — CSS margin between
		// elements is invisible to a screen reader
		const statusText = $.derived(() => activeIndex() >= 0
			? `${format(dates[activeIndex()], 'day')} — ${data[activeIndex()].value}`
			: 'No day selected');

		function onkeydown(e) {
			// don't hijack keys while the user is typing elsewhere on the page
			const target = e.target;

			if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;

			const actions = {
				ArrowRight: () => step(1),
				ArrowLeft: () => step(-1),
				Escape: () => context?.tooltip.hide()
			};

			const action = actions[e.key];

			if (action) {
				e.preventDefault();
				action();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2"><div class="flex items-center gap-2">`);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => step(-1),
						children: ($$renderer) => {
							$$renderer.push(`<!---->← Prev`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => step(1),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Next →`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				onclick: () => context?.tooltip.hide(),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clear`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="text-sm text-surface-content/70" aria-live="polite">${$.escape(statusText())}</div> `);

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 200,
				padding: { left: 40, bottom: 20 },
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
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