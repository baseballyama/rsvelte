import * as $ from 'svelte/internal/server';
import FacetPanel from './FacetPanel.svelte';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Facet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// No `Axis` here on purpose — every layer renders a `<Facet>`, so importing it would put one of
		// the larger components in every chart's bundle.  The grid's headers are `<FacetAxis>`.
		let { children } = $$props;

		const ctx = getChartContext();

		if (ctx.facet.enabled) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(ctx.facet.panels);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let facet = each_array[$$index];

				FacetPanel($$renderer, { facet, children });
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
			children?.($$renderer, { facet: ctx.facet.panels[0] });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}