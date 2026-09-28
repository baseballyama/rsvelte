import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { Arc, Chart, Layer, Pie, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Labels_outer_with_padding($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	const keyClasses = [
		{ shape: 'fill-info', content: 'fill-info-content' },
		{ shape: 'fill-success', content: 'fill-success-content' },
		{ shape: 'fill-warning', content: 'fill-warning-content' },
		{ shape: 'fill-danger', content: 'fill-danger-content' }
	];

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'value',
		c: 'date',
		height: 320,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let arcs = () => ($$arg0?.()).arcs;
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							$.each(node, 17, arcs, $.index, ($$anchor, arc, index) => {
								const colors = $.derived(() => keyClasses[index]);

								{
									const children = ($$anchor, $$arg0) => {
										let getArcTextProps = () => ($$arg0?.()).getArcTextProps;

										{
											let $0 = $.derived(() => getArcTextProps()('outer', { startOffset: '50%', outerPadding: 8 }));
											let $1 = $.derived(() => cls('text-sm '));

											Text($$anchor, $.spread_props(
												{
													get value() {
														return $.get(arc).data.value;
													}
												},
												() => $.get($0),
												{
													get class() {
														return $.get($1);
													}
												}
											));
										}
									};

									Arc($$anchor, {
										get startAngle() {
											return $.get(arc).startAngle;
										},

										get endAngle() {
											return $.get(arc).endAngle;
										},

										get padAngle() {
											return $.get(arc).padAngle;
										},

										get class() {
											return $.get(colors).shape;
										},
										children,
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						Pie($$anchor, { children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}