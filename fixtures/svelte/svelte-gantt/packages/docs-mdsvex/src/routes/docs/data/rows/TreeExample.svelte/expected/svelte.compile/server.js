import * as $ from 'svelte/internal/server';
import { time } from '$lib';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';

export default function TreeExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="example border my-12 svelte-49eobx"><div class="text-center border-b">Click on row headers to expand and collapse.</div> `);

		SvelteGantt($$renderer, {
			from: time('8:00'),
			to: time('12:00'),
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
			ganttTableModules: [SvelteGanttTable]
		});

		$$renderer.push(`<!----></div>`);
	});
}