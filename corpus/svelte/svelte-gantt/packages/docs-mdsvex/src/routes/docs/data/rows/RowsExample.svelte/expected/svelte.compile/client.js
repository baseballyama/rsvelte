import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { time } from '$lib';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';

var root = $.from_html(`<div class="example border my-12 svelte-sjte42"><!></div>`);

export default function RowsExample($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => time('8:00'));
		let $1 = $.derived(() => time('12:00'));
		let $2 = $.derived(() => [SvelteGanttTable]);

		SvelteGantt(node, {
			get from() {
				return $.get($0);
			},

			get to() {
				return $.get($1);
			},

			rows: [
				{ id: 1, label: 'Using the label' },
				{
					id: 2,
					label: 'Apply custom classes',
					classes: 'row-gradient'
				},

				{
					id: 3,
					label: 'With custom html content',
					contentHtml: '<div class="h-full flex justify-center items-center"><span class="bg-gradient-to-tr from-pink-500 to-violet-500 text-violet-50 px-1">Custom html content</span></div>'
				},

				{
					id: 4,
					headerHtml: '<div class="h-full flex justify-center items-center"><span class="bg-gradient-to-tr from-pink-500 to-violet-500 text-violet-50 px-1">This time in header</span></div>'
				}
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