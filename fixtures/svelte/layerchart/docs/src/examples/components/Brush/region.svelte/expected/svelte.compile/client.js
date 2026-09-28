import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Brush, Chart, Layer, defaultChartPadding } from 'layerchart';
import { format, PeriodType } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-sm text-surface-content/70 mb-2 h-5"><!></div> <!>`, 1);

export default function Region($$anchor, $$props) {
	$.push($$props, true);

	let brush = $.state(void 0);
	const range = $.derived(() => $.get(brush)?.active ? $.get(brush).x : null);
	const LANE_HEIGHT = 32;
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''} – ${$1 ?? ''}`), [
				() => format($.get(range)[0], PeriodType.Day),
				() => format($.get(range)[1], PeriodType.Day)
			]);

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('Drag along the lane below the chart');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(range)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					Area(node_4, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => context().height - LANE_HEIGHT);

						Brush(node_5, {
							get y() {
								return $.get($0);
							},
							height: LANE_HEIGHT,
							classes: { root: 'fill-surface-content/5', selection: 'fill-primary/25' },
							get state() {
								return $.get(brush);
							},

							set state($$value) {
								$.set(brush, $$value, true);
							}
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

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
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}