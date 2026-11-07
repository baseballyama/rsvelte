import * as $ from 'svelte/internal/server';
import { chord as d3Chord, chordDirected, chordTranspose } from 'd3-chord';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Chord($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			matrix,
			variant = 'default',
			padAngle = 0,
			sortGroups = null,
			sortSubgroups = null,
			sortChords = null,
			innerRadiusRatio = 0.9,
			children
		} = $$props;

		const ctx = getChartContext();
		const outerRadius = $.derived(() => Math.max(0, Math.min(ctx.width, ctx.height) / 2));
		const innerRadius = $.derived(() => outerRadius() * innerRadiusRatio);

		const chordLayout = $.derived(() => {
			const generator = variant === 'directed'
				? chordDirected()
				: variant === 'transpose' ? chordTranspose() : d3Chord();

			generator.padAngle(padAngle);

			if (sortGroups != null) {
				generator.sortGroups(sortGroups);
			}

			if (sortSubgroups != null) {
				generator.sortSubgroups(sortSubgroups);
			}

			if (sortChords != null) {
				generator.sortChords(sortChords);
			}

			return generator(matrix);
		});

		children?.($$renderer, {
			groups: chordLayout().groups,
			chords: chordLayout(),
			innerRadius: innerRadius(),
			outerRadius: outerRadius()
		});

		$$renderer.push(`<!---->`);
	});
}