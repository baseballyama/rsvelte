import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { utcFormat } from 'd3-time-format';
import { utcDay } from 'd3-time';

var root = $.from_svg(`<rect class="day svelte-8h91bp" role="tooltip"><title> </title></rect>`);

export default function CalendarMonth($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $x = () => $.store_get(x, '$x', $$stores);
	const $z = () => $.store_get(z, '$z', $$stores);
	const $zScale = () => $.store_get(zScale, '$zScale', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $extents = () => $.store_get(extents, '$extents', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { width, height, data, x, z, zScale, extents } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {(w: number, h: number) => number} [calcCellSize] - A function given the canvas width and height as arguments and expects a return number that will be used as the width and height for each cell. The default will choose a size that fits seven cells across and five rows top to bottom.
	 */
	/** @type {Props} */
	let calcCellSize = $.prop($$props, 'calcCellSize', 3, (w, h) => Math.min(w / 7, h / 5));

	const getDate = utcFormat('%Y-%m-%d');
	const getDayOfWeek = utcFormat('%w');
	const getWeekOfYear = utcFormat('%U');

	let count = $.derived(() => (date) => {
		const stringDate = date.toISOString().split('T')[0];
		const days = $data().filter((d) => $x()(d) === stringDate)[0];

		if (days) {
			return $z()(days);
		}

		return 0;
	});

	let fillColor = $.derived(() => (day) => {
		const n = $.get(count)(day);

		return n ? $zScale()(n) : '#fff';
	});

	let cellSize = $.derived(() => calcCellSize()($width(), $height()));

	/**
	 * Calculate what month we're in and generate the full days of that month
	 */
	/** @type {Date[]} */
	let days = $.derived(() => {
		const minDate = $extents().x[0];
		const parts = minDate.split('-').map((d) => +d);

		return utcDay.range(new Date(Date.UTC(parts[0], parts[1] - 1, 1)), new Date(Date.UTC(parts[0], parts[1], 1)));
	});

	let rectX = $.derived(() => (day) => +getDayOfWeek(day) * $.get(cellSize));

	let rectY = $.derived(() => (day) => {
		const startWeek = +getWeekOfYear(new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1)));
		const thisWeek = +getWeekOfYear(day);
		const weekDiff = thisWeek - startWeek;

		return weekDiff * $.get(cellSize);
	});

	/**
	 * @param {Date} day
	 */
	function showCount(day) {
		console.log(day, $.get(count)(day));
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(days), $.index, ($$anchor, day) => {
		var rect = root();
		var title = $.child(rect);
		var text = $.only_child(title, true);

		$.reset(rect);

		$.template_effect(
			($0, $1, $2, $3) => {
				$.set_attribute(rect, 'width', $.get(cellSize));
				$.set_attribute(rect, 'height', $.get(cellSize));
				$.set_attribute(rect, 'x', $0);
				$.set_attribute(rect, 'y', $1);
				$.set_style(rect, `fill:${$2 ?? ''};`);
				$.set_text(text, $3);
			},
			[
				() => $.get(rectX)($.get(day)),
				() => $.get(rectY)($.get(day)),
				() => $.get(fillColor)($.get(day)),
				() => getDate($.get(day))
			]
		);

		$.event('mouseenter', rect, () => showCount($.get(day)));
		$.append($$anchor, rect);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}