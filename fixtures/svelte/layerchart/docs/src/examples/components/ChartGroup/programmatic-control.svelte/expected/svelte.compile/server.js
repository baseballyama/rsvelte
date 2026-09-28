import * as $ from 'svelte/internal/server';
import { ChartGroupState, LineChart } from 'layerchart';
import { format } from '@layerstack/utils';
import { Button, ButtonGroup } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

export default function Programmatic_control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const panels = [
			{
				key: 'requests',
				label: 'Requests',
				data: createDateSeries({ count: 30, min: 400, max: 900, value: 'integer' }),
				color: 'var(--color-info-500)'
			},

			{
				key: 'errors',
				label: 'Errors',
				data: createDateSeries({ count: 30, min: 0, max: 30, value: 'integer' }),
				color: 'var(--color-danger-500)'
			}
		];

		const group = new ChartGroupState();

		// The shared timeline every chart is indexed against
		const dates = panels[0].data.map((d) => d.date);

		const activeIndex = $.derived(() => group.pointer.active ? dates.findIndex((d) => +d === +group.pointer.x) : -1);

		function step(delta) {
			// start at the beginning when nothing is selected
			const next = activeIndex() === -1 ? 0 : activeIndex() + delta;

			if (next < 0 || next >= dates.length) return;

			group.setPointer({ x: dates[next] });
		}

		// Built as a single string so the announced text has real separators — CSS margin between
		// elements is invisible to a screen reader, which would read "627Errors: 30"
		const statusText = $.derived(() => activeIndex() >= 0
			? `${format(dates[activeIndex()], 'day')} — ` + panels.map((p) => `${p.label}: ${p.data[activeIndex()]?.value}`).join(', ')
			: 'No day selected');

		function onkeydown(e) {
			// don't hijack keys while the user is typing elsewhere on the page
			const target = e.target;

			if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;

			const actions = {
				ArrowRight: () => step(1),
				ArrowLeft: () => step(-1),
				Escape: () => group.clearPointer()
			};

			const action = actions[e.key];

			if (action) {
				e.preventDefault();
				action();
			}
		}

		const data = panels;

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
			onclick: () => group.clearPointer(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clear`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="text-sm text-surface-content/70" aria-live="polite">${$.escape(statusText())}</div> <!--[-->`);

		const each_array = $.ensure_array_like(panels);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let panel = each_array[$$index];

			$$renderer.push(`<div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70">${$.escape(panel.label)}</div> `);

			LineChart($$renderer, {
				data: panel.data,
				x: 'date',
				y: 'value',
				series: [{ key: 'value', label: panel.label, color: panel.color }],
				group,
				height: 100,
				padding: { left: 40, bottom: 20 }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { data });
	});
}