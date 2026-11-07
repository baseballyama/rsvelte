import * as $ from 'svelte/internal/server';
import { time } from '$lib';
import moment from 'moment';
import { MomentSvelteGanttDateAdapter, SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';

export default function CreateTasksExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="border"><div class="text-center border-b">Click and drag on the timeline to create a task.</div> `);

		SvelteGantt($$renderer, {
			from: time('06:00'),
			to: time('14:00'),
			fitWidth: true,
			minWidth: 400,
			dateAdapter: new MomentSvelteGanttDateAdapter(moment),
			rows: [
				{ id: 11, label: 'Petunia Mulliner' },
				{ id: 12, label: 'Mélina Giacovetti' },
				{ id: 13, label: 'Marlène Lasslett' },
				{ id: 14, label: 'Adda Youell' }
			],
			ganttTableModules: [SvelteGanttTable],
			enableCreateTask: opts.enableCreateTask,
			onCreateTask: opts.onCreateTask,
			onCreatedTask: opts.onCreatedTask
		});

		$$renderer.push(`<!----></div>`);
	});
}