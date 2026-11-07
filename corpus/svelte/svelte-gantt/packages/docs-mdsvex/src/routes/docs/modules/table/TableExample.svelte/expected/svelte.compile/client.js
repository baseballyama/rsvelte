import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';
import { defaultOptions, time } from '$lib';

var root = $.from_html(`<div class="border"><!></div>`);

export default function TableExample($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => time('8:00'));
		let $1 = $.derived(() => time('14:00'));
		let $2 = $.derived(() => [SvelteGanttTable]);

		SvelteGantt(node, {
			get from() {
				return $.get($0);
			},

			get to() {
				return $.get($1);
			},

			tableHeaders: [
				{ title: 'Name', property: 'label', width: 150 },
				{ title: 'Age', property: 'age', width: 50 }
			],
			rows: [
				{ id: 1, label: 'Resource #1', age: 50 },
				{ id: 2, label: 'Resource #2', age: 43 },
				{ id: 3, label: 'Resource #3', age: 23 },
				{ id: 4, label: 'Resource #4', age: 65 }
			],

			get ganttTableModules() {
				return $.get($2);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}