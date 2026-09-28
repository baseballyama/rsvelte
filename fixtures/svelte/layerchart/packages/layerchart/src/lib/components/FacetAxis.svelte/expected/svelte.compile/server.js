import * as $ from 'svelte/internal/server';
import Axis from './Axis/Axis.svelte';
import Group from './Group/Group.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { getFacetPanel, setFacetPanel } from '$lib/contexts/facet.js';
import { getObjectOrNull } from '$lib/utils/common.js';

export default function FacetAxis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		const axisProps = $.derived(() => getObjectOrNull(axis()));

		if (ctx.facet.enabled && axis() !== false && isFirstPanel()) {
			$$renderer.push('<!--[0-->');

			if (ctx.facet.xScale && ctx.facet.xDomain.length > 1) {
				$$renderer.push('<!--[0-->');

				Axis($$renderer, $.spread_props([
					{
						placement: 'top',
						scale: ctx.facet.xScale,
						ticks: ctx.facet.xDomain,
						tickLength: 0,
						tickLabelProps: { dy: -8 },
						rule: false,
						class: 'lc-facet-axis-x'
					},
					axisProps()
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (ctx.facet.yScale && ctx.facet.yDomain.length > 1) {
				$$renderer.push('<!--[0-->');

				Group($$renderer, {
					x: ctx.box.width - ctx.facet.width,
					children: ($$renderer) => {
						Axis($$renderer, $.spread_props([
							{
								placement: 'right',
								scale: ctx.facet.yScale,
								ticks: ctx.facet.yDomain,
								tickLength: 0,
								tickLabelProps: { dx: 8 },
								rule: false,
								class: 'lc-facet-axis-y'
							},
							axisProps()
						]));
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}