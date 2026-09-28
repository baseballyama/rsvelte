import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LineChart, Chart, Area, Layer, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Pan_zoom_with_overview($$anchor, $$props) {
	$.push($$props, true);

	let mainContext = $.state(void 0);
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		LineChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			transform: {
				mode: 'domain',
				axis: 'x',
				scaleExtent: [1, 50],
				domainExtent: {
					x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
				}
			},
			clip: true,
			get padding() {
				return $.get($0);
			},
			height: 300,
			get context() {
				return $.get(mainContext);
			},

			set context($$value) {
				$.set(mainContext, $$value, true);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			x: $.get(mainContext)?.xDomain,
			onChange: (e) => {
				if ($.get(mainContext) && e.brush.active) {
					$.get(mainContext).zoomToBrush(e.brush, 'x');
				}
			},

			onBrushEnd: (e) => {
				if ($.get(mainContext) && !e.brush.active) {
					$.get(mainContext).transform.reset();
				}
			}
		}));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			padding: { left: 16 },
			get brush() {
				return $.get($0);
			},
			height: 40,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Area($$anchor, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});
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