import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteGantt, SvelteGanttTable, SvelteGanttExternal } from 'svelte-gantt/svelte';
import { defaultOptions, time } from '$lib';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="border"><div class="flex p-2 border-b"><div class="px-2 border bg-slate-100 select-none">Drag to gantt</div></div> <!></div>`);

export default function ExternalExample($$anchor, $$props) {
	$.push($$props, true);

	let element;
	let gantt;
	let tasks = [];

	onMount(() => {
		new SvelteGanttExternal(element, {
			gantt,
			onsuccess: (row, date, gantt) => {
				console.log('success');

				tasks = [
					...tasks,
					{
						id: tasks.length,
						resourceId: row.model.id,
						label: 'New task',
						from: date,
						to: date + 60 * 60 * 1000
					}
				];
			},
			onfail: () => {}
		});
	});

	var // TODO:: make external accept any gantt implicitly
	div = root();

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.bind_this(div_2, ($$value) => element = $$value, () => element);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => time('8:00'));
		let $1 = $.derived(() => time('14:00'));
		let $2 = $.derived(() => [SvelteGanttTable]);

		$.bind_this(
			SvelteGantt(node, {
				get from() {
					return $.get($0);
				},

				get to() {
					return $.get($1);
				},

				get tasks() {
					return tasks;
				},

				rows: [
					{ id: 1, label: 'Resource #1' },
					{ id: 2, label: 'Resource #2' },
					{ id: 3, label: 'Resource #3' },
					{ id: 4, label: 'Resource #4' }
				],

				get ganttTableModules() {
					return $.get($2);
				}
			}),
			($$value) => gantt = $$value,
			() => gantt
		);
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}