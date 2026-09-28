import * as $ from 'svelte/internal/server';
import Code from '$lib/docs/Code.svelte';
import DocPage from '$lib/docs/DocPage.svelte';
import { base } from '$app/paths';

export const ssr = false;

export default function Props($$renderer) {
	const props = [
		{
			name: 'selected',
			defaultVal: 'new Date()',
			description: 'The currently-selected date.'
		},

		{
			name: 'start',
			defaultVal: "dayjs().add(-100, 'year').toDate()",
			description: 'The minimum date a user can select.'
		},

		{
			name: 'end',
			defaultVal: "dayjs(start).add(100, 'year').toDate()",
			description: 'The maximum date a user can select.'
		},

		{
			name: 'format',
			defaultVal: "'MM/DD/YYYY'",
			description: 'A `dayjs` format expression.  Used when updating the read-only `formatted` prop.'
		},

		{
			name: 'startOfWeekIndex',
			defaultVal: '0',
			description: 'Which date.getDay() should be considered the start of the week (eg: 1 would indicate week should start on Monday)'
		},

		{
			name: 'formatted',
			defaultVal: 'undefined',
			description: 'Readonly prop which provides a formatted version of the currently-selected date.'
		},

		{
			name: 'store',
			defaultVal: 'datepickerStore.get({ selected, start, end, startOfWeekIndex })',
			description: 'Readonly prop which provides access to the internal store.'
		},

		{
			name: 'theme',
			defaultVal: '{}',
			description: `An object containing theme/style overrides for the component.  See <a href="${base}/docs/theme-editor/light">theme-editor documentation</a>`
		},

		{
			name: 'defaultTheme',
			defaultVal: 'undefined',
			description: 'The default theme to extend with the `theme` prop.  When this prop is not set the `light` theme will be used by default.'
		}
	];

	DocPage($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="table svelte-all8a8"><div class="table-title svelte-all8a8">Name</div> <div class="table-title svelte-all8a8">Default</div> <div class="table-title svelte-all8a8">Description</div> <!--[-->`);

			const each_array = $.ensure_array_like(props);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { name, defaultVal, description } = each_array[$$index];

				$$renderer.push(`<div class="svelte-all8a8">${$.escape(name)}</div> `);
				Code($$renderer, { source: defaultVal, language: 'js' });
				$$renderer.push(`<!----> <div class="svelte-all8a8"><span>${$.html(description)}</span></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		},

		$$slots: {
			default: true,
			title: ($$renderer) => {
				{
					$$renderer.push(`Props`);
				}
			}
		}
	});
}