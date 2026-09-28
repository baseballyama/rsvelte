import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { Month, Chart, Layer, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { intervalOffset } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function _0_days($$anchor, $$props) {
	$.push($$props, true);

	const now = new Date();
	const ninetyDaysAgo = intervalOffset('day', now, -90);

	const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
		return { ...d, value: Math.random() > 0.2 ? d.value : null };
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleThreshold().unknown('transparent'));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [25, 50, 75],
			cRange: [
				'var(--color-primary-100)',
				'var(--color-primary-300)',
				'var(--color-primary-500)',
				'var(--color-primary-700)'
			],
			height: 400,
			clip: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						Month($$anchor, {
							get start() {
								return ninetyDaysAgo;
							},

							get end() {
								return now;
							},
							tooltip: true
						});
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
									Tooltip_List($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													label: 'value',
													get value() {
														return data().value;
													},
													format: 'integer',
													valueAlign: 'right'
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							};

							$.if(node_3, ($$render) => {
								if (data().value != null) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}