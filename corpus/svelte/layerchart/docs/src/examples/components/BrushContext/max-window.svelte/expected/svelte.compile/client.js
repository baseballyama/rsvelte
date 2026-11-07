import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, ChartClipPath, Layer, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="mb-2 text-sm">Window: <span class="font-semibold"> </span> <span class="text-surface-content/50"></span></div> <!> <!>`, 1);

export default function Max_window($$anchor, $$props) {
	$.push($$props, true);

	const DAY = 24 * 60 * 60 * 1000;
	const maxDays = 90;

	// Live brush selection — also drives the detail chart's visible range
	let brushX = $.state($.proxy([null, null]));

	const selectedDays = $.derived(() => $.get(brushX)?.[0] != null && $.get(brushX)?.[1] != null
		? Math.round((+$.get(brushX)[1] - +$.get(brushX)[0]) / DAY)
		: null);

	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var span = $.sibling($.child(div));
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);

	span_1.textContent = '— drag the overview to brush; capped at 90 days';
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get xDomain() {
				return $.get(brushX);
			},
			yDomain: [0, null],
			get padding() {
				return $.get($0);
			},
			height: 220,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						ChartClipPath(node_3, {
							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									line: { class: 'stroke-2 stroke-primary' },
									class: 'fill-primary/20'
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			maxExtent: { x: maxDays * DAY },
			x: $.get(brushX),
			onChange: (e) => $.set(brushX, e.brush.x, true)
		}));

		let $1 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart(node_4, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get brush() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 60,
			class: 'mt-2',
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_5 = $.first_child(fragment_5);

						Axis(node_5, { placement: 'bottom', rule: true });

						var node_6 = $.sibling(node_5, 2);

						Area(node_6, { class: 'fill-surface-content/10' });
						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.template_effect(() => $.set_text(text, $.get(selectedDays) != null ? `${$.get(selectedDays)} days` : 'full range'));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}