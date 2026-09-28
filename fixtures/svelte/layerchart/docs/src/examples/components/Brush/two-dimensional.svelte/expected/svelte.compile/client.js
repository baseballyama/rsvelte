import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { range } from 'd3-array';

import {
	Axis,
	Brush,
	Chart,
	Circle,
	Layer,
	Points,
	defaultChartPadding
} from 'layerchart';

import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-sm text-surface-content/70 mb-2 h-5"><!></div> <!>`, 1);

export default function Two_dimensional($$anchor, $$props) {
	$.push($$props, true);

	const data = range(200).map((d) => ({ x: d, y: Math.random() }));
	let brush = $.state(void 0);
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} of ${data.length ?? ''} points selected`), [() => data.filter((d) => $.get(brush).contains(d)).length]);
			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('Drag to select points');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(brush)?.active) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 20, left: 20, bottom: 24 }));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'x',
			y: 'y',
			yDomain: [0, null],
			yNice: true,
			get padding() {
				return $.get($0);
			},
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						Axis(node_2, { placement: 'left', grid: true, rule: true });

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, { placement: 'bottom', rule: true });

						var node_4 = $.sibling(node_3, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let points = () => ($$arg0?.()).points;
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.each(node_5, 17, points, $.index, ($$anchor, point) => {
									const isSelected = $.derived(() => $.get(brush)?.contains($.get(point).data) ?? false);

									{
										let $0 = $.derived(() => $.get(isSelected) ? 4 : 2);

										let $1 = $.derived(() => cls($.get(isSelected)
											? 'fill-primary/30 stroke-primary'
											: 'fill-neutral/10 stroke-neutral'));

										Circle($$anchor, {
											get cx() {
												return $.get(point).x;
											},

											get cy() {
												return $.get(point).y;
											},

											get r() {
												return $.get($0);
											},

											get class() {
												return $.get($1);
											},
											motion: 'spring'
										});
									}
								});

								$.append($$anchor, fragment_4);
							};

							Points(node_4, { children, $$slots: { default: true } });
						}

						var node_6 = $.sibling(node_4, 2);

						Brush(node_6, {
							axis: 'both',
							get state() {
								return $.get(brush);
							},

							set state($$value) {
								$.set(brush, $$value, true);
							}
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