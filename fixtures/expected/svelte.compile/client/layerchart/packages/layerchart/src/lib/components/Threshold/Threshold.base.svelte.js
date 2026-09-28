import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { min, max } from 'd3-array';
import { getChartContext } from '$lib/contexts/chart.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Threshold_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	// Mark as composite so child Areas don't register
	ctx.registerComponent({ name: 'Threshold', kind: 'composite-mark' });

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => $$props.curve, ($$anchor) => {
		var fragment_1 = root();
		var node_1 = $.first_child(fragment_1);

		{
			const clip = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => $$props.Area, ($$anchor, Area_1) => {
					Area_1($$anchor, {
						y0: (d) => ctx.y(d)[1],
						y1: (d) => max(ctx.yDomain),
						get curve() {
							return $$props.curve;
						},

						get defined() {
							return $$props.defined;
						}
					});
				});

				$.append($$anchor, fragment_2);
			};

			$.component(node_1, () => $$props.ClipPath, ($$anchor, ClipPath_1) => {
				ClipPath_1($$anchor, {
					clip,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.above ?? $.noop, () => ({ curve: $$props.curve, defined: $$props.defined }));
						$.append($$anchor, fragment_3);
					},
					$$slots: { clip: true, default: true }
				});
			});
		}

		var node_4 = $.sibling(node_1, 2);

		{
			const clip = ($$anchor) => {
				var fragment_4 = $.comment();
				var node_5 = $.first_child(fragment_4);

				$.component(node_5, () => $$props.Area, ($$anchor, Area_2) => {
					Area_2($$anchor, {
						y0: (d) => min(ctx.yDomain),
						y1: (d) => ctx.y(d)[1],
						get curve() {
							return $$props.curve;
						},

						get defined() {
							return $$props.defined;
						}
					});
				});

				$.append($$anchor, fragment_4);
			};

			$.component(node_4, () => $$props.ClipPath, ($$anchor, ClipPath_2) => {
				ClipPath_2($$anchor, {
					clip,
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_6 = $.first_child(fragment_5);

						$.snippet(node_6, () => $$props.below ?? $.noop, () => ({ curve: $$props.curve, defined: $$props.defined }));
						$.append($$anchor, fragment_5);
					},
					$$slots: { clip: true, default: true }
				});
			});
		}

		var node_7 = $.sibling(node_4, 2);

		$.snippet(node_7, () => $$props.children ?? $.noop, () => ({ curve: $$props.curve, defined: $$props.defined }));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}