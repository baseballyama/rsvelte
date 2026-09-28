import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Axis from './Axis/Axis.svelte';
import Group from './Group/Group.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { getFacetPanel, setFacetPanel } from '$lib/contexts/facet.js';
import { getObjectOrNull } from '$lib/utils/common.js';

var root = $.from_html(`<!> <!>`, 1);

export default function FacetAxis($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	// Rendered inside the layer, which repeats its children per panel — but the headers belong to
	// the grid, so they're drawn once, from the panel at the plot's origin.
	const panel = getFacetPanel();

	const isFirstPanel = $.derived(() => {
		const current = panel?.();

		return current == null || current.column === 0 && current.row === 0;
	});

	// These headers belong to the grid, not to the panel they happen to be rendered from — so the
	// panel is cleared for them, and `Axis` doesn't apply its per-panel edge rule.  Without this the
	// `fy` header is hidden whenever the grid has more than one column.
	setFacetPanel(undefined);

	const axis = $.derived(() => ctx.props.facet?.axis ?? true);
	const axisProps = $.derived(() => getObjectOrNull($.get(axis)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Axis($$anchor, $.spread_props(
						{
							placement: 'top',
							get scale() {
								return ctx.facet.xScale;
							},

							get ticks() {
								return ctx.facet.xDomain;
							},
							tickLength: 0,
							tickLabelProps: { dy: -8 },
							rule: false,
							class: 'lc-facet-axis-x'
						},
						() => $.get(axisProps)
					));
				};

				$.if(node_1, ($$render) => {
					if (ctx.facet.xScale && ctx.facet.xDomain.length > 1) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => ctx.box.width - ctx.facet.width);

						Group($$anchor, {
							get x() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								Axis($$anchor, $.spread_props(
									{
										placement: 'right',
										get scale() {
											return ctx.facet.yScale;
										},

										get ticks() {
											return ctx.facet.yDomain;
										},
										tickLength: 0,
										tickLabelProps: { dx: 8 },
										rule: false,
										class: 'lc-facet-axis-y'
									},
									() => $.get(axisProps)
								));
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_2, ($$render) => {
					if (ctx.facet.yScale && ctx.facet.yDomain.length > 1) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (ctx.facet.enabled && $.get(axis) !== false && $.get(isFirstPanel)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}