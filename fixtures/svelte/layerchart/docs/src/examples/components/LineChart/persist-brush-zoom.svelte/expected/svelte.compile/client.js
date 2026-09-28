import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LineChart, Chart, Area, Layer, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<div class="text-center pb-4 text-sm">Select desired brush range, reload the page, and it will persist.</div> <!> <!>`, 1);

export default function Persist_brush_zoom($$anchor, $$props) {
	$.push($$props, true);

	const STORAGE_KEY = 'layerchart:persist-brush-zoom:range';
	let context = $.state(void 0);

	// Read before the first render, so the chart opens at the saved range rather than zooming to it
	// afterwards — `transform.initialDomain` is applied from the first frame.
	function loadRange() {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) return undefined;

		const parsed = JSON.parse(saved);

		if (!Array.isArray(parsed) || parsed.length !== 2) return undefined;

		return [new Date(parsed[0]), new Date(parsed[1])];
	}

	const initialDomain = loadRange();

	// Save whenever the zoomed domain changes
	$.user_effect(() => {
		const range = $.get(context)?.xDomain;

		if (range) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(range));
		}
	});

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => ({
			mode: 'domain',
			axis: 'x',
			scaleExtent: [1, 50],
			initialDomain: initialDomain ? { x: initialDomain } : undefined,
			domainExtent: {
				x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
			}
		}));

		let $1 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		LineChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			get transform() {
				return $.get($0);
			},
			clip: true,
			get padding() {
				return $.get($1);
			},
			height: 300,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			x: $.get(context)?.xDomain,
			onChange: (e) => {
				if ($.get(context) && e.brush.active) {
					$.get(context).zoomToBrush(e.brush, 'x');
				}
			},

			onBrushEnd: (e) => {
				if ($.get(context) && !e.brush.active) {
					$.get(context).transform.reset();
					localStorage.removeItem(STORAGE_KEY);
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
	$.pop();
}