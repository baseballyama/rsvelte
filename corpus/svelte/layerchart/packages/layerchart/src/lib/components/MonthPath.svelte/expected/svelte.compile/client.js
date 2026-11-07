import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { timeWeek } from 'd3-time';
import { cls } from '@layerstack/tailwind';
import { endOfInterval } from '@layerstack/utils';
import Path from './Path/Path.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'date',
	'cellSize',
	'startOfRange',
	'pathRef',
	'class'
]);

export default function MonthPath($$anchor, $$props) {
	$.push($$props, true);

	let pathRefProp = $.prop($$props, 'pathRef', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let pathRef = $.state(void 0);

	$.user_pre_effect(() => {
		pathRefProp($.get(pathRef));
	});

	const cellSize = $.derived(() => Array.isArray($$props.cellSize)
		? $$props.cellSize
		: [$$props.cellSize, $$props.cellSize]);

	// start of month
	const startDayOfWeek = $.derived(() => $$props.date.getDay());

	const startWeek = $.derived(() => timeWeek.count($$props.startOfRange, $$props.date));

	// end of month
	const monthEnd = $.derived(() => endOfInterval('month', $$props.date));

	const endDayOfWeek = $.derived(() => $.get(monthEnd).getDay());
	const endWeek = $.derived(() => timeWeek.count($$props.startOfRange, $.get(monthEnd)));

	const pathData = $.derived(() => `
    M${($.get(startWeek) + 1) * $.get(cellSize)[0]},${$.get(startDayOfWeek) * $.get(cellSize)[1]}
    H${$.get(startWeek) * $.get(cellSize)[0]} V${$.get(cellSize)[1] * 7}
    H${$.get(endWeek) * $.get(cellSize)[0]} V${($.get(endDayOfWeek) + 1) * $.get(cellSize)[1]}
    H${($.get(endWeek) + 1) * $.get(cellSize)[0]} V0
    H${($.get(startWeek) + 1) * $.get(cellSize)[0]}Z
  `);

	{
		let $0 = $.derived(() => cls('lc-month-path', $$props.class));

		Path($$anchor, $.spread_props(
			{
				get pathData() {
					return $.get(pathData);
				},
				fill: 'none',
				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				get pathRef() {
					return $.get(pathRef);
				},

				set pathRef($$value) {
					$.set(pathRef, $$value, true);
				}
			}
		));
	}

	$.pop();
}