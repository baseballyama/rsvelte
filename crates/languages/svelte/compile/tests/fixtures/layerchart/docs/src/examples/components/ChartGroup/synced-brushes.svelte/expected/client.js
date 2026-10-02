import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { timeDay } from 'd3-time';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	ChartGroup,
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

	const now = new Date();

	// The range the group opens brushed to
	const initialRange = [timeDay.offset(now, -60), timeDay.offset(now, -30)];

	const seriesData = Array.from({ length: 4 }, () => randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })));

	const colorScale = scaleOrdinal([
		'var(--color-success-500)',
		'var(--color-info-500)',
		'var(--color-warning-500)',
		'var(--color-danger-500)'
	]);

	const data = seriesData[0];
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let group = () => ($$arg0?.()).group;
			const selection = $.derived(() => group().brush.active ? group().brush.x : undefined);
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
						return $.get(selection);
					},
					y: 'value',
					yBaseline: 0,
					padding: { left: 16, bottom: 24 },
					height: 100,
					children: ($$anchor, $$slotProps) => {
						Layer($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_1 = $.first_child(fragment_2);

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

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node, 2);

				Chart(node_5, {
					get data() {
						return $.get(data);
					},
					x: 'date',
					y: 'value',
					padding: { left: 16 },
					brush: true,
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

				$.reset(div_1);
				$.template_effect(($0) => styles = $.set_style(div_1, '', styles, { '--chart-color': $0 }), [() => colorScale(String(i))]);
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => ({ x: initialRange }));

		ChartGroup($$anchor, {
			get brush() {
				return $.get($0);
			},
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}