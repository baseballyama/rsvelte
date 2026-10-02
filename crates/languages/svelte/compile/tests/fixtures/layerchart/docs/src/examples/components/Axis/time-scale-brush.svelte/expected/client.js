import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { timeYear } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';
import AxisControls from '$lib/components/controls/AxisControls.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Time_scale_brush($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());
	let initialXDomain = [timeYear.offset(today, -4), today];
	let xDomain = $.state($.proxy(initialXDomain));
	let tickSpacing = $.state(80 // x-axis default
	);
	var fragment = root_1();
	var node = $.first_child(fragment);

	AxisControls(node, {
		get value() {
			return $.get(tickSpacing);
		},

		set value($$value) {
			$.set(tickSpacing, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		get xDomain() {
			return $.get(xDomain);
		},
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		brush: {
			onBrushEnd: (e) => {
				$.set(xDomain, e.brush.x, true);
				e.brush.reset();
			}
		},
		height: 200,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, {
						placement: 'bottom',
						rule: true,
						grid: true,
						get tickSpacing() {
							return $.get(tickSpacing);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'left' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => ({
			x: $.get(xDomain),
			onChange: (e) => {
				$.set(xDomain, e.brush.x, true);
			}
		}));

		Chart(node_4, {
			get xDomain() {
				return initialXDomain;
			},
			padding: { top: 20, bottom: 20, left: 20, right: 20 },
			get brush() {
				return $.get($0);
			},
			height: 80,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => ({ interval: timeYear.every(1) }));

							Axis($$anchor, {
								placement: 'bottom',
								rule: true,
								grid: true,
								get ticks() {
									return $.get($0);
								}
							});
						}
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