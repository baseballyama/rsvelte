import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from '$lib/docs/Code.svelte';
import DocPage from '$lib/docs/DocPage.svelte';
import { base } from '$app/paths';

export const ssr = false;

var root = $.from_html(`<div class="svelte-all8a8"> </div> <!> <div class="svelte-all8a8"><span></span></div>`, 1);
var root_1 = $.from_html(`<div class="table svelte-all8a8"><div class="table-title svelte-all8a8">Name</div> <div class="table-title svelte-all8a8">Default</div> <div class="table-title svelte-all8a8">Description</div> <!></div>`);

export default function Props($$anchor) {
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

	DocPage($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.sibling($.child(div), 6);

			$.each(node, 17, () => props, $.index, ($$anchor, $$item) => {
				let name = () => $.get($$item).name;
				let defaultVal = () => $.get($$item).defaultVal;
				let description = () => $.get($$item).description;
				var fragment_1 = root();
				var div_1 = $.first_child(fragment_1);
				var text = $.only_child(div_1, true);
				var node_1 = $.sibling(div_1, 2);

				Code(node_1, {
					get source() {
						return defaultVal();
					},
					language: 'js'
				});

				var div_2 = $.sibling(node_1, 2);
				var span = $.child(div_2);

				$.html(span, description, true);
				$.reset(span);
				$.reset(div_2);
				$.template_effect(() => $.set_text(text, name()));
				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Props');

				$.append($$anchor, text_1);
			}
		}
	});
}