import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { timeDay } from 'd3-time';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	Layer,
	LinearGradient,
	Rule
} from 'layerchart';

import { randomWalk } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="border rounded-sm p-4 grid gap-1"><!> <!></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-2 gap-4"></div>`);

export default function Synced_brushes($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 7);
	const now = new Date();
	let xDomain = $.state($.proxy([timeDay.offset(now, -60), timeDay.offset(now, -30)]));

	const seriesData = [
		randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })),
		randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })),
		randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })),
		randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value }))
	];

	const colorScale = scaleOrdinal([
		'var(--color-success-500)',
		'var(--color-info-500)',
		'var(--color-warning-500)',
		'var(--color-danger-500)'
	]);

	var $$exports = {
		get data() {
			return data();
		},

		set data($$value) {
			data($$value);
		}
	};

	var div = root_2();

	$.each(div, 21, () => seriesData, $.index, ($$anchor, data, i, $$array) => {
		var div_1 = root_1();
		let styles;
		var node = $.child(div_1);

		Chart(node, {
			get data() {
				return $.get(data);
			},
			x: 'date',
			get xDomain() {
				return $.get(xDomain);
			},
			y: 'value',
			yBaseline: 0,
			padding: { left: 16, bottom: 24 },
			height: 100,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom' });

						var node_3 = $.sibling(node_2, 2);

						Rule(node_3, { y: 0 });

						var node_4 = $.sibling(node_3, 2);

						ChartClipPath(node_4, {
							children: ($$anchor, $$slotProps) => {
								{
									const children = ($$anchor, $$arg0) => {
										let gradient = () => ($$arg0?.()).gradient;

										Area($$anchor, {
											line: { class: 'stroke-2 stroke-(--chart-color)' },
											get fill() {
												return gradient();
											}
										});
									};

									LinearGradient($$anchor, {
										class: 'from-[color-mix(in_lch,var(--chart-color)_50%,_transparent)] to-transparent',
										vertical: true,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		var node_5 = $.sibling(node, 2);

		{
			let $0 = $.derived(() => ({
				x: $.get(xDomain),
				onChange: (e) => $.set(xDomain, e.brush.x, true)
			}));

			Chart(node_5, {
				get data() {
					return $.get(data);
				},
				x: 'date',
				y: 'value',
				padding: { left: 16 },
				get brush() {
					return $.get($0);
				},
				height: 20,
				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Area($$anchor, {
								line: { class: 'stroke-2 stroke-(--chart-color)' },
								class: 'fill-(--chart-color) opacity-20'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$.reset(div_1);
		$.template_effect(($0) => styles = $.set_style(div_1, '', styles, { '--chart-color': $0 }), [() => colorScale(String(i))]);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}