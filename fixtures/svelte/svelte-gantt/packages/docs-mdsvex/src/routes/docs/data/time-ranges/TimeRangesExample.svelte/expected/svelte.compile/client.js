import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { time } from '$lib';
import { SvelteGantt } from 'svelte-gantt/svelte';

var root = $.from_html(`<div class="example border my-12 svelte-1n4uhxb"><!></div>`);

export default function TimeRangesExample($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => time('8:00'));
		let $1 = $.derived(() => time('14:00'));

		let $2 = $.derived(() => [
			{
				id: 1,
				from: time('8:00'),
				to: time('9:00'),
				classes: null,
				label: 'Breakfast'
			},

			{
				id: 0,
				from: time('10:00'),
				to: time('11:00'),
				classes: 'time-range-lunch',
				label: 'Lunch',
				resizable: false
			},

			{
				id: 2,
				from: time('12:00'),
				to: time('13:00'),
				label: 'Custom class',
				classes: 'gradient'
			}
		]);

		SvelteGantt(node, {
			get from() {
				return $.get($0);
			},

			get to() {
				return $.get($1);
			},
			minWidth: 400,
			fitWidth: true,
			rows: [{ id: 1 }, { id: 2 }],
			get timeRanges() {
				return $.get($2);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}