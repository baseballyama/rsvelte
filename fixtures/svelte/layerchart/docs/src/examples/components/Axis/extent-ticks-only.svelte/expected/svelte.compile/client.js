import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Text } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Extent_ticks_only($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeDay.offset(today, -10), today]);

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},
			yDomain: [0, 100],
			padding: { top: 20, bottom: 20, left: 20, right: 20 },
			height: 200,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						{
							const tickLabel = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								let index = () => ($$arg0?.()).index;

								{
									let $0 = $.derived(() => index() === 0 ? 'start' : 'end');

									Text($$anchor, $.spread_props(props, {
										get textAnchor() {
											return $.get($0);
										}
									}));
								}
							};

							Axis(node, {
								placement: 'bottom',
								rule: true,
								ticks: (scale) => scale.domain(),
								format: { type: 'day', options: { variant: 'long' } },
								tickLabel,
								$$slots: { tickLabel: true }
							});
						}

						var node_1 = $.sibling(node, 2);

						Axis(node_1, {
							placement: 'left',
							rule: true,
							ticks: (scale) => scale.domain()
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}