import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeMonth } from 'd3-time';

const data = await getAppleStock();
var root = $.from_html(`Snapped: <span class="font-semibold"> </span>`, 1);
var root_1 = $.from_html(`<span class="text-surface-content/50">Drag to brush — edges snap to whole months</span>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="mb-2 text-sm"><!></div> <!>`, 1);

export default function Snap_to_month($$anchor, $$props) {
	$.push($$props, true);

	let brushX = $.state($.proxy([null, null]));

	function monthLabel(value) {
		return value instanceof Date
			? value.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
			: '';
	}

	var $$exports = { data };
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var span = $.sibling($.first_child(fragment_1));
			var text = $.only_child(span);

			$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''} – ${$1 ?? ''}`), [
				() => monthLabel($.get(brushX)[0]),
				() => monthLabel($.get(brushX)[1])
			]);

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var span_1 = root_1();

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($.get(brushX)?.[0] != null && $.get(brushX)?.[1] != null) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		let $1 = $.derived(() => ({
			constrain: ({ x, y }) => ({
				x: x[0] != null && x[1] != null ? [timeMonth.floor(x[0]), timeMonth.ceil(x[1])] : x,
				y
			}),
			x: $.get(brushX),
			onChange: (e) => $.set(brushX, e.brush.x, true)
		}));

		Chart(node_1, {
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
						var fragment_3 = root_2();
						var node_2 = $.first_child(fragment_3);

						Axis(node_2, { placement: 'left', grid: true, rule: true });

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, { placement: 'bottom', rule: true });

						var node_4 = $.sibling(node_3, 2);

						Area(node_4, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}