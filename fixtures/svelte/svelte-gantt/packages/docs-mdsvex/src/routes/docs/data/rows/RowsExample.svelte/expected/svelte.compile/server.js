import * as $ from 'svelte/internal/server';
import { time } from '$lib';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';

export default function RowsExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="example border my-12 svelte-sjte42">`);

		SvelteGantt($$renderer, {
			from: time('8:00'),
			to: time('12:00'),
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
			ganttTableModules: [SvelteGanttTable]
		});

		$$renderer.push(`<!----></div>`);
	});
}