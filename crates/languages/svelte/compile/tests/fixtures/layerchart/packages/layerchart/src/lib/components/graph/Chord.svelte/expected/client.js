import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { chord as d3Chord, chordDirected, chordTranspose } from 'd3-chord';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Chord($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, 'default'),
		padAngle = $.prop($$props, 'padAngle', 3, 0),
		sortGroups = $.prop($$props, 'sortGroups', 3, null),
		sortSubgroups = $.prop($$props, 'sortSubgroups', 3, null),
		sortChords = $.prop($$props, 'sortChords', 3, null),
		innerRadiusRatio = $.prop($$props, 'innerRadiusRatio', 3, 0.9);

	const ctx = getChartContext();
	const outerRadius = $.derived(() => Math.max(0, Math.min(ctx.width, ctx.height) / 2));
	const innerRadius = $.derived(() => $.get(outerRadius) * innerRadiusRatio());

	const chordLayout = $.derived(() => {
		const generator = variant() === 'directed'
			? chordDirected()
			: variant() === 'transpose' ? chordTranspose() : d3Chord();

		generator.padAngle(padAngle());

		if (sortGroups() != null) {
			generator.sortGroups(sortGroups());
		}

		if (sortSubgroups() != null) {
			generator.sortSubgroups(sortSubgroups());
		}

		if (sortChords() != null) {
			generator.sortChords(sortChords());
		}

		return generator($$props.matrix);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({
		groups: $.get(chordLayout).groups,
		chords: $.get(chordLayout),
		innerRadius: $.get(innerRadius),
		outerRadius: $.get(outerRadius)
	}));

	$.append($$anchor, fragment);
	$.pop();
}