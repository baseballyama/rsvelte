import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import AnnotationLine from '../AnnotationLine/AnnotationLine.svelte';
import AnnotationPoint from '../AnnotationPoint/AnnotationPoint.svelte';
import AnnotationRange from '../AnnotationRange/AnnotationRange.svelte';

export default function ChartAnnotations($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	let visibleAnnotations = $.derived(() => $$props.annotations.filter((a) => (a.layer === $$props.layer || a.layer == null && $$props.layer === 'above') && (ctx.series.highlightKey == null || a.seriesKey == null || a.seriesKey === ctx.series.highlightKey) && ctx.series.visibleSeries.some((s) => a.seriesKey == null || a.seriesKey === s.key)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(visibleAnnotations), $.index, ($$anchor, annotation) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				AnnotationPoint($$anchor, $.spread_props(() => $.get(annotation)));
			};

			var consequent_1 = ($$anchor) => {
				AnnotationLine($$anchor, $.spread_props(() => $.get(annotation)));
			};

			var consequent_2 = ($$anchor) => {
				AnnotationRange($$anchor, $.spread_props(() => $.get(annotation)));
			};

			$.if(node_1, ($$render) => {
				if ($.get(annotation).type === 'point') $$render(consequent); else if ($.get(annotation).type === 'line') $$render(consequent_1, 1); else if ($.get(annotation).type === 'range') $$render(consequent_2, 2);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}