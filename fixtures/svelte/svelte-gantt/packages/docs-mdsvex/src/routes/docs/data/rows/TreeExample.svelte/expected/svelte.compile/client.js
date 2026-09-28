import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { time } from '$lib';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';

var root = $.from_html(`<div class="example border my-12 svelte-49eobx"><div class="text-center border-b">Click on row headers to expand and collapse.</div> <!></div>`);

export default function TreeExample($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.sibling($.child(div), 2);

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
			tableHeaders: [{ title: 'Title', property: 'label', type: 'tree' }],
			rows: [
				{
					id: 1,
					label: 'Parent 1',
					expanded: false,
					children: [{ id: 11, label: 'Child 1' }, { id: 12, label: 'Child 2' }]
				},

				{
					id: 2,
					label: 'Parent 2',
					expanded: true,
					children: [
						{
							id: 21,
							label: 'Child 1',
							children: [{ id: 211, label: 'Grandchild 1' }]
						},
						{ id: 22, label: 'Child 2' },
						{ id: 23, label: 'Child 3' }
					]
				},
				{ id: 3, label: 'No children' }
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