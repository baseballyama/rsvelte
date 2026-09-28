import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { utcFormat } from 'd3-time-format';
import { utcDay } from 'd3-time';

export default function CalendarMonth($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { width, height, data, x, z, zScale, extents } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {(w: number, h: number) => number} [calcCellSize] - A function given the canvas width and height as arguments and expects a return number that will be used as the width and height for each cell. The default will choose a size that fits seven cells across and five rows top to bottom.
		 */
		/** @type {Props} */
		let { calcCellSize = (w, h) => Math.min(w / 7, h / 5) } = $$props;

		const getDate = utcFormat('%Y-%m-%d');
		const getDayOfWeek = utcFormat('%w');
		const getWeekOfYear = utcFormat('%U');

		let count = $.derived(() => (date) => {
			const stringDate = date.toISOString().split('T')[0];
			const days = $.store_get($$store_subs ??= {}, '$data', data).filter((d) => $.store_get($$store_subs ??= {}, '$x', x)(d) === stringDate)[0];

			if (days) {
				return $.store_get($$store_subs ??= {}, '$z', z)(days);
			}

			return 0;
		});

		let fillColor = $.derived(() => (day) => {
			const n = count()(day);

			return n
				? $.store_get($$store_subs ??= {}, '$zScale', zScale)(n)
				: '#fff';
		});

		let cellSize = $.derived(() => calcCellSize($.store_get($$store_subs ??= {}, '$width', width), $.store_get($$store_subs ??= {}, '$height', height)));

		/**
		 * Calculate what month we're in and generate the full days of that month
		 */
		/** @type {Date[]} */
		let days = $.derived(() => {
			const minDate = $.store_get($$store_subs ??= {}, '$extents', extents).x[0];
			const parts = minDate.split('-').map((d) => +d);

			return utcDay.range(new Date(Date.UTC(parts[0], parts[1] - 1, 1)), new Date(Date.UTC(parts[0], parts[1], 1)));
		});

		let rectX = $.derived(() => (day) => +getDayOfWeek(day) * cellSize());

		let rectY = $.derived(() => (day) => {
			const startWeek = +getWeekOfYear(new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1)));
			const thisWeek = +getWeekOfYear(day);
			const weekDiff = thisWeek - startWeek;

			return weekDiff * cellSize();
		});

		/**
		 * @param {Date} day
		 */
		function showCount(day) {
			console.log(day, count()(day));
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(days());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let day = each_array[$$index];

			$$renderer.push(`<rect class="day svelte-8h91bp"${$.attr('width', cellSize())}${$.attr('height', cellSize())}${$.attr('x', rectX()(day))}${$.attr('y', rectY()(day))}${$.attr_style(`fill:${$.stringify(fillColor()(day))};`)} role="tooltip"><title>${$.escape(getDate(day))}</title></rect>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}