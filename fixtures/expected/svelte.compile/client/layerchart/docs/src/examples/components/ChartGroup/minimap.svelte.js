import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { range } from 'd3-array';

import {
	Axis,
	Chart,
	ChartClipPath,
	ChartGroup,
	Circle,
	Layer,
	Points,
	defaultChartPadding
} from 'layerchart';

import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative"><!> <div class="absolute top-1 right-1 w-[25%] h-[25%] border rounded-sm bg-surface-100"><!></div></div>`);

export default function Minimap($$anchor, $$props) {
	$.push($$props, true);

	const data = range(200).map((d) => ({ x: d, y: Math.random() }));
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let group = () => ($$arg0?.()).group;
			const viewport = $.derived(() => group().brush.active ? group().brush : group().domain);
			const viewportX = $.derived(() => $.get(viewport).x ?? [null, null]);
			const viewportY = $.derived(() => $.get(viewport).y ?? [null, null]);
			var div = root_1();
			var node = $.child(div);

			{
				let $0 = $.derived(() => defaultChartPadding({ left: 20, bottom: 24 }));

				Chart(node, {
					get data() {
						return data;
					},
					x: 'x',
					y: 'y',
					yNice: true,
					brush: { axis: 'both', zoomOnBrush: true },
					get padding() {
						return $.get($0);
					},
					height: 400,
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
										Points($$anchor, { class: 'fill-primary/30 stroke-primary', r: 4 });
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

			var div_1 = $.sibling(node, 2);
			var node_4 = $.child(div_1);

			{
				const children = ($$anchor, $$arg0) => {
					let context = () => ($$arg0?.()).context;

					Layer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let points = () => ($$arg0?.()).points;
									var fragment_6 = $.comment();
									var node_5 = $.first_child(fragment_6);

									$.each(node_5, 17, points, $.index, ($$anchor, point) => {
										const isSelected = $.derived(() => context().brush.contains($.get(point).data));

										{
											let $0 = $.derived(() => cls($.get(isSelected)
												? 'fill-primary/30 stroke-primary'
												: 'fill-surface-content/10 stroke-neutral'));

											Circle($$anchor, {
												get cx() {
													return $.get(point).x;
												},

												get cy() {
													return $.get(point).y;
												},
												r: 0.5,
												get class() {
													return $.get($0);
												},
												motion: 'spring'
											});
										}
									});

									$.append($$anchor, fragment_6);
								};

								Points($$anchor, { children, $$slots: { default: true } });
							}
						},
						$$slots: { default: true }
					});
				};

				let $0 = $.derived(() => ({ axis: 'both', x: $.get(viewportX), y: $.get(viewportY) }));

				Chart(node_4, {
					get data() {
						return data;
					},
					x: 'x',
					y: 'y',
					yNice: true,
					get brush() {
						return $.get($0);
					},
					groupOptions: { publish: ['domain'], subscribe: ['pointer'] },
					children,
					$$slots: { default: true }
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		ChartGroup($$anchor, {
			domain: { axis: 'both' },
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}