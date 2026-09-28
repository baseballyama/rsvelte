import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChartGroup, LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70"> </div> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-2"></div>`);

export default function Highlight_only($$anchor, $$props) {
	$.push($$props, true);

	const panels = [
		{
			key: 'requests',
			label: 'Requests',
			data: createDateSeries({ count: 40, min: 400, max: 900, value: 'integer' }),
			color: 'var(--color-info-500)'
		},

		{
			key: 'latency',
			label: 'Latency (ms)',
			data: createDateSeries({ count: 40, min: 20, max: 180, value: 'integer' }),
			color: 'var(--color-warning-500)'
		},

		{
			key: 'errors',
			label: 'Errors',
			data: createDateSeries({ count: 40, min: 0, max: 30, value: 'integer' }),
			color: 'var(--color-danger-500)'
		}
	];

	const data = panels;
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let group = () => ($$arg0?.()).group;
			var div = root_1();

			$.each(div, 21, () => panels, (panel) => panel.key, ($$anchor, panel) => {
				const isChartActive = $.derived(() => group().pointer.source === $.get(panel).key);
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

					let $1 = $.derived(() => ({ lines: true, points: $.get(isChartActive) }));

					LineChart(node, {
						get id() {
							return $.get(panel).key;
						},

						get data() {
							return $.get(panel).data;
						},
						x: 'date',
						y: 'value',
						get series() {
							return $.get($0);
						},

						get highlight() {
							return $.get($1);
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
		};

		ChartGroup($$anchor, {
			pointer: { tooltip: false },
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}