import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { time } from '$lib';
import moment from 'moment';
import { MomentSvelteGanttDateAdapter, SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';

var root = $.from_html(`<div class="border"><div class="text-center border-b">Click and drag on the timeline to create a task.</div> <!></div>`);

export default function CreateTasksExample($$anchor, $$props) {
	$.push($$props, true);

	let id = 0;

	const opts = {
		enableCreateTask: true,
		onCreateTask: (e) => {
			id++;

			return { id, label: `New task ${id}`, ...e };
		},

		onCreatedTask: (task) => {
			console.log('task created', task);
		}
	};

	var div = root();
	var node = $.sibling($.child(div), 2);

	{
		let $0 = $.derived(() => time('06:00'));
		let $1 = $.derived(() => time('14:00'));
		let $2 = $.derived(() => new MomentSvelteGanttDateAdapter(moment));
		let $3 = $.derived(() => [SvelteGanttTable]);

		SvelteGantt(node, {
			get from() {
				return $.get($0);
			},

			get to() {
				return $.get($1);
			},
			fitWidth: true,
			minWidth: 400,
			get dateAdapter() {
				return $.get($2);
			},

			rows: [
				{ id: 11, label: 'Petunia Mulliner' },
				{ id: 12, label: 'Mélina Giacovetti' },
				{ id: 13, label: 'Marlène Lasslett' },
				{ id: 14, label: 'Adda Youell' }
			],

			get ganttTableModules() {
				return $.get($3);
			},

			get enableCreateTask() {
				return opts.enableCreateTask;
			},

			get onCreateTask() {
				return opts.onCreateTask;
			},

			get onCreatedTask() {
				return opts.onCreatedTask;
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}