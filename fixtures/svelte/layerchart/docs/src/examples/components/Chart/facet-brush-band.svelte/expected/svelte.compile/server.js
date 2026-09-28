import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';

export default function Facet_brush_band($$renderer, $$props) {
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	]; // prettier-ignore

	const regions = ['North', 'South', 'West'];

	const data = regions.flatMap((region, r) => months.map((month, m) => ({
		region,
		month,
		value: Math.round(140 + 60 * Math.sin(m / 2 + r) + 8 * m)
	})));

	let selection = null;

	/**
	 * Categories are selected by position rather than by value: `brush.x` holds the first and last
	 * month of the selection, and the months between them are the ones the domain puts between
	 * them — not the ones that sort between them, which would be `Apr` through `Jan`.
	 */
	function selectedMonths(brush) {
		if (!brush.active) return null;

		const [first, last] = brush.x.map((month) => months.indexOf(month));

		return months.slice(Math.min(first, last), Math.max(first, last) + 1);
	}

	BarChart($$renderer, {
		data,
		x: 'month',
		y: 'value',
		fx: 'region',
		xDomain: months,
		grid: true,
		brush: {
			axis: 'x',
			zoomOnBrush: false,
			onChange: (e) => selection = selectedMonths(e.brush)
		},
		props: {
			bars: {
				opacity: (d) => selection == null || selection.includes(d.month) ? 1 : 0.25,
				motion: 'spring'
			},
			xAxis: { tickSpacing: 30, tickLabelProps: { class: 'text-[10px]' } }
		},
		padding: { left: 40, bottom: 32, top: 24, right: 8 },
		height: 280
	});

	$.bind_props($$props, { data });
}