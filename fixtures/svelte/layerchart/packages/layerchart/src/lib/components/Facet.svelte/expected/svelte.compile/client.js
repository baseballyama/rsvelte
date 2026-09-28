import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FacetPanel from './FacetPanel.svelte';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Facet($$anchor, $$props) {
	$.push($$props, true);

	// No `Axis` here on purpose — every layer renders a `<Facet>`, so importing it would put one of
	// the larger components in every chart's bundle.  The grid's headers are `<FacetAxis>`.
	const ctx = getChartContext();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => ctx.facet.panels, (facet) => facet.key, ($$anchor, facet) => {
				FacetPanel($$anchor, {
					get facet() {
						return $.get(facet);
					},

					get children() {
						return $$props.children;
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ facet: ctx.facet.panels[0] }));
			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (ctx.facet.enabled) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}