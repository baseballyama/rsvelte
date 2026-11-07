import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import AnnotationLine from '../AnnotationLine/AnnotationLine.svelte';
import AnnotationPoint from '../AnnotationPoint/AnnotationPoint.svelte';
import AnnotationRange from '../AnnotationRange/AnnotationRange.svelte';

export default function ChartAnnotations($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { annotations, layer } = $$props;
		const ctx = getChartContext();
		let visibleAnnotations = $.derived(() => annotations.filter((a) => (a.layer === layer || a.layer == null && layer === 'above') && (ctx.series.highlightKey == null || a.seriesKey == null || a.seriesKey === ctx.series.highlightKey) && ctx.series.visibleSeries.some((s) => a.seriesKey == null || a.seriesKey === s.key)));

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(visibleAnnotations());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let annotation = each_array[$$index];

			if (annotation.type === 'point') {
				$$renderer.push('<!--[0-->');
				AnnotationPoint($$renderer, $.spread_props([annotation]));
			} else if (annotation.type === 'line') {
				$$renderer.push('<!--[1-->');
				AnnotationLine($$renderer, $.spread_props([annotation]));
			} else if (annotation.type === 'range') {
				$$renderer.push('<!--[2-->');
				AnnotationRange($$renderer, $.spread_props([annotation]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}