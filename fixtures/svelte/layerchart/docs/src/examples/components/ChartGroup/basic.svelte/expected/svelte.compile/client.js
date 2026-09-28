import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChartGroup, LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70"> </div> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-2"></div>`);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const panels = [
		{
			label: 'Requests',
			data: createDateSeries({ count: 40, min: 400, max: 900, value: 'integer' }),
			color: 'var(--color-info-500)'
		},

		{
			label: 'Latency (ms)',
			data: createDateSeries({ count: 40, min: 20, max: 180, value: 'integer' }),
			color: 'var(--color-warning-500)'
		},

		{
			label: 'Errors',
			data: createDateSeries({ count: 40, min: 0, max: 30, value: 'integer' }),
			color: 'var(--color-danger-500)'
		}
	];

	const data = panels;
	var $$exports = { data };

	ChartGroup($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.each(div, 21, () => panels, (panel) => panel.label, ($$anchor, panel) => {
				var div_1 = root();
				var div_2 = $.child(div_1);
				var text = $.only_child(div_2, true);
				var node = $.sibling(div_2, 2);

				{
					let $0 = $.derived(() => [
						{
							key: 'value',
							label: $.get(panel).label,
							color: $.get(panel).color
						}
					]);

					LineChart(node, {
						get data() {
							return $.get(panel).data;
						},
						x: 'date',
						y: 'value',
						get series() {
							return $.get($0);
						},
						height: 100,
						padding: { left: 40, bottom: 20 }
					});
				}

				$.reset(div_1);
				$.template_effect(() => $.set_text(text, $.get(panel).label));
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}