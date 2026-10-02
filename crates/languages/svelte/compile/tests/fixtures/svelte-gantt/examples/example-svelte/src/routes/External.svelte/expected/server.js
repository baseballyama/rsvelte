import * as $ from 'svelte/internal/server';

import {
	SvelteGantt,
	SvelteGanttDependencies,
	SvelteGanttExternal,
	SvelteGanttTable,
	MomentSvelteGanttDateAdapter
} from 'svelte-gantt';

import { onMount, getContext } from 'svelte';
import { time } from '../utils';
import moment from 'moment';
import GanttOptions from '../components/GanttOptions.svelte';

export default function External($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const currentStart = time('06:00');
		const currentEnd = time('18:00');
		const colors = ['blue', 'green', 'orange'];
		let options2 = getContext('options');

		const data = {
			rows: [
				{ id: 1, label: "Accounting" },
				{ id: 2, label: "Business Development" },
				{ id: 3, label: "Ida Flewan" },
				{ id: 4, label: "Lauréna Shrigley" },
				{ id: 5, label: "Ange Kembry" }
			],
			tasks: [
				{
					id: 3,
					resourceId: 1,
					label: "PET-CT",
					from: time("13:30"),
					to: time("15:00"),
					classes: "orange"
				},

				{
					id: 4,
					resourceId: 1,
					label: "Auditing",
					from: time("9:30"),
					to: time("11:30"),
					classes: "orange"
				},

				{
					id: 5,
					resourceId: 2,
					label: "Security Clearance",
					from: time("15:15"),
					to: time("16:00"),
					classes: "green"
				},

				{
					id: 6,
					resourceId: 2,
					label: "Policy Analysis",
					from: time("14:00"),
					to: time("17:00"),
					classes: "blue"
				},

				{
					id: 7,
					resourceId: 2,
					label: "Xbox 360",
					from: time("13:00"),
					to: time("14:00"),
					classes: "blue"
				},

				{
					id: 8,
					resourceId: 3,
					label: "GNU/Linux",
					from: time("14:00"),
					to: time("15:30"),
					classes: "blue"
				},

				{
					id: 9,
					resourceId: 4,
					label: "Electronic Trading",
					from: time("15:00"),
					to: time("17:00"),
					classes: "green"
				},

				{
					id: 10,
					resourceId: 5,
					label: "Alternative Medicine",
					from: time("14:30"),
					to: time("15:30"),
					classes: "orange"
				}
			],
			dependencies: []
		};

		let options = {
			dateAdapter: new MomentSvelteGanttDateAdapter(moment),
			rows: data.rows,
			tasks: data.tasks,
			dependencies: data.dependencies,
			timeRanges: [],
			columnOffset: 15,
			magnetOffset: 15,
			rowHeight: 52,
			rowPadding: 6,
			headers: [
				{ unit: 'day', format: 'MMMM Do' },
				{ unit: 'hour', format: 'H:mm' }
			],
			fitWidth: true,
			minWidth: 800,
			from: currentStart,
			to: currentEnd,
			tableHeaders: [
				{ title: 'Label', property: 'label', width: 140, type: 'tree' }
			],
			tableWidth: 240,
			ganttTableModules: [SvelteGanttTable],
			ganttBodyModules: [SvelteGanttDependencies]
		};

		let gantt;

		onMount(() => {
			window.gantt = gantt = new SvelteGantt({
				target: document.getElementById('example-gantt'),
				props: options
			});

			const external = new SvelteGanttExternal(document.getElementById('new-task'), {
				gantt,
				onsuccess: (row, date, gantt) => {
					console.log(row.model.id, new Date(date).toISOString());

					const id = 5000 + Math.floor(Math.random() * 1000);

					gantt.updateTask({
						id,
						label: `Task #${id}`,
						from: date,
						to: date + 3 * 60 * 60 * 1000,
						classes: colors[Math.random() * colors.length | 0],
						resourceId: row.model.id
					});
				},

				elementContent: () => {
					const element = document.createElement('div');

					element.innerHTML = 'New Task';
					element.className = 'sg-external-indicator';

					return element;
				}
			});
		});

		function onChangeOptions(event) {
			const opts = event.detail;

			Object.assign(options, opts);
			gantt.$set(options);
		}

		$$renderer.push(`<div class="container svelte-1l4gkqo"><div id="example-gantt" class="svelte-1l4gkqo"></div> <div id="new-task" class="svelte-1l4gkqo">Drag to gantt</div> `);
		GanttOptions($$renderer, { options });
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}