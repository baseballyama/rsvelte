import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';
import { defaultOptions, time } from '$lib';
import moment from 'moment';

export const zoomLevels = [
	{
		headers: [{ unit: 'month', format: 'MMM YYYY' }],
		minWidth: 800,
		columnUnit: 'day',
		columnOffset: 1
	},

	{
		headers: [
			{ unit: 'month', format: 'MMM YYYY' },
			{ unit: 'week', format: '[week] w' },
			{ unit: 'day', format: 'D' }
		],
		minWidth: 3200,
		columnUnit: 'hour',
		columnOffset: 4
	},

	{
		headers: [
			{ unit: 'day', format: 'MMM D, YYYY' },
			{ unit: 'hour', format: 'HH' }
		],
		minWidth: 8000,
		columnUnit: 'hour',
		columnOffset: 2
	},

	{
		headers: [
			{ unit: 'day', format: 'MMM D, YYYY' },
			{ unit: 'hour', format: 'HH' }
		],
		minWidth: 16000,
		columnUnit: 'hour',
		columnOffset: 2
	},

	{
		headers: [
			{ unit: 'day', format: 'MMM D, YYYY' },
			{ unit: 'hour', format: 'HH' }
		],
		minWidth: 32000,
		columnUnit: 'hour',
		columnOffset: 2
	}
];

var root = $.from_html(`<span><button class="border hover:bg-slate-100 px-1 py-1 text-sm active:bg-slate-200"> </button></span>`);
var root_1 = $.from_html(`<div class="border"><div class="flex gap-2 justify-center border-b p-2"><span>Set zoom:</span> <!></div> <div class="example svelte-tf8ets"><!></div></div>`);

export default function ZoomExample($$anchor, $$props) {
	$.push($$props, true);

	const values = ['hour', 'day', 'week', 'month'];
	let headers = [{ unit: 'month', format: 'MMM YYYY' }];
	let minWidth = 800;
	let fitWidth = true;
	let columnUnit = 'day';
	let columnOffset = 1;
	let from = moment().startOf('month');
	let to = moment().endOf('month');

	// TODO:: zoom focus is not right? always moves to right
	// TODO:: allow click on header focus to be customized
	function applyZoom(level) {
		headers = level.headers;
		minWidth = level.minWidth;
		columnUnit = level.columnUnit;
		columnOffset = level.columnOffset;
	}

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	$.each(node, 17, () => values, $.index, ($$anchor, value, i) => {
		var span = root();
		var button = $.child(span);
		var text = $.only_child(button, true);

		$.reset(span);
		$.template_effect(() => $.set_text(text, $.get(value)));
		$.event('click', button, () => applyZoom(zoomLevels[i]));
		$.append($$anchor, span);
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => [
			{
				id: 1,
				resourceId: 1,
				from: time('8:00'),
				to: time('16:00'),
				label: 'Default',
				classes: 'blue'
			},

			{
				id: 4,
				resourceId: 2,
				from: time('9:00'),
				to: time('17:00'),
				label: 'Default',
				classes: 'orange'
			},

			{
				id: 7,
				resourceId: 3,
				from: time('10:00'),
				to: time('18:00'),
				label: 'Default',
				classes: 'blue'
			}
		]);

		SvelteGantt(node_1, {
			get from() {
				return from;
			},

			get to() {
				return to;
			},

			rows: [
				{ id: 1, label: 'Resource #1' },
				{ id: 2, label: 'Resource #2' },
				{ id: 3, label: 'Resource #3' },
				{ id: 4, label: 'Resource #4' }
			],

			get headers() {
				return headers;
			},

			get minWidth() {
				return minWidth;
			},
			fitWidth,
			get columnUnit() {
				return columnUnit;
			},

			get columnOffset() {
				return columnOffset;
			},

			get dateAdapter() {
				return defaultOptions.dateAdapter;
			},

			get zoomLevels() {
				return zoomLevels;
			},

			get tasks() {
				return $.get($0);
			}
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}