import * as $ from 'svelte/internal/server';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';
import { defaultOptions, time } from '$lib';

export default function LayoutExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let layout = 'overlap';
		const values = ['overlap', 'pack', 'expand'];

		$$renderer.push(`<div class="border"><div class="flex gap-2 justify-center border-b p-2"><span><code>layout</code>:</span> <!--[-->`);

		const each_array = $.ensure_array_like(values);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let value = each_array[$$index];

			$$renderer.push(`<span><input${$.attr('id', value)} type="radio"${$.attr('checked', layout === value, true)}${$.attr('value', value)}/> <label${$.attr('for', value)}><code>'${$.escape(value)}'</code></label></span>`);
		}

		$$renderer.push(`<!--]--></div> <div class="example svelte-zuv2a">`);

		SvelteGantt($$renderer, {
			from: time('8:00'),
			to: time('14:00'),
			layout,
			rows: [
				{ id: 1, label: 'Resource #1' },
				{ id: 2, label: 'Resource #2' },
				{ id: 3, label: 'Resource #3' },
				{ id: 4, label: 'Resource #4' }
			],
			tasks: [
				{
					id: 1,
					resourceId: 1,
					from: time('8:00'),
					to: time('10:00'),
					label: 'Default',
					classes: 'blue'
				},

				{
					id: 2,
					resourceId: 1,
					from: time('9:00'),
					to: time('11:00'),
					label: 'Default',
					classes: 'orange'
				},

				{
					id: 3,
					resourceId: 1,
					from: time('9:30'),
					to: time('12:00'),
					label: 'Default',
					classes: 'violet'
				},

				{
					id: 4,
					resourceId: 2,
					from: time('9:00'),
					to: time('11:00'),
					label: 'Default',
					classes: 'blue'
				},

				{
					id: 5,
					resourceId: 2,
					from: time('9:30'),
					to: time('11:00'),
					label: 'Default',
					classes: 'orange'
				},

				{
					id: 6,
					resourceId: 2,
					from: time('11:00'),
					to: time('13:00'),
					label: 'Default',
					classes: 'violet'
				},

				{
					id: 7,
					resourceId: 3,
					from: time('9:00'),
					to: time('11:00'),
					label: 'Default',
					classes: 'blue'
				}
			],
			ganttTableModules: [SvelteGanttTable]
		});

		$$renderer.push(`<!----></div></div>`);
	});
}