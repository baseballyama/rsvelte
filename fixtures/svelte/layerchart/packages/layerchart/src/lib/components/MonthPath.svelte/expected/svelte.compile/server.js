import * as $ from 'svelte/internal/server';
import { timeWeek } from 'd3-time';
import { cls } from '@layerstack/tailwind';
import { endOfInterval } from '@layerstack/utils';
import Path from './Path/Path.svelte';

export default function MonthPath($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			date,
			cellSize: cellSizeProp,
			startOfRange,
			pathRef: pathRefProp = void 0,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let pathRef = void 0;
		const cellSize = $.derived(() => Array.isArray(cellSizeProp) ? cellSizeProp : [cellSizeProp, cellSizeProp]);

		// start of month
		const startDayOfWeek = $.derived(() => date.getDay());

		const startWeek = $.derived(() => timeWeek.count(startOfRange, date));

		// end of month
		const monthEnd = $.derived(() => endOfInterval('month', date));

		const endDayOfWeek = $.derived(() => monthEnd().getDay());
		const endWeek = $.derived(() => timeWeek.count(startOfRange, monthEnd()));

		const pathData = $.derived(() => `
    M${(startWeek() + 1) * cellSize()[0]},${startDayOfWeek() * cellSize()[1]}
    H${startWeek() * cellSize()[0]} V${cellSize()[1] * 7}
    H${endWeek() * cellSize()[0]} V${(endDayOfWeek() + 1) * cellSize()[1]}
    H${(endWeek() + 1) * cellSize()[0]} V0
    H${(startWeek() + 1) * cellSize()[0]}Z
  `);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Path($$renderer, $.spread_props([
				{
					pathData: pathData(),
					fill: 'none',
					class: cls('lc-month-path', className)
				},
				restProps,
				{
					get pathRef() {
						return pathRef;
					},

					set pathRef($$value) {
						pathRef = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { pathRef: pathRefProp });
	});
}