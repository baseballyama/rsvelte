import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="mb-2 text-sm">Selection: <span class="font-semibold"> </span> <span class="text-surface-content/50"></span></div> <!>`, 1);

export default function Min_max_extent($$anchor, $$props) {
	$.push($$props, true);

	const DAY = 24 * 60 * 60 * 1000;
	const minDays = 30;
	const maxDays = 180;
	let brushX = $.state($.proxy([null, null]));

	const selectedDays = $.derived(() => $.get(brushX)?.[0] != null && $.get(brushX)?.[1] != null
		? Math.round((+$.get(brushX)[1] - +$.get(brushX)[0]) / DAY)
		: null);

	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var span = $.sibling($.child(div));
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);

	span_1.textContent = '— try to drag smaller than 30 or larger than 180 days';
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		let $1 = $.derived(() => ({
			minExtent: { x: minDays * DAY },
			maxExtent: { x: maxDays * DAY },
			x: $.get(brushX),
			onChange: (e) => $.set(brushX, e.brush.x, true)
		}));

		Chart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			get padding() {
				return $.get($0);
			},

			get brush() {
				return $.get($1);
			},
			height: 260,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						Area(node_3, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.template_effect(() => $.set_text(text, $.get(selectedDays) != null ? `${$.get(selectedDays)} days` : '—'));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}