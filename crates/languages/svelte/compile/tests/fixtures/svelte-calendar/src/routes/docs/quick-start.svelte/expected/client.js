import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from '$lib/docs/Code.svelte';
import DocPage from '$lib/docs/DocPage.svelte';
import { base } from '$app/paths';

export const ssr = false;

var root = $.from_html(`<ol class="svelte-1tle3nc"><li><h3 class="svelte-1tle3nc">Install with NPM or Yarn</h3> <!></li> <li><h3 class="svelte-1tle3nc">Import and implement the datepicker</h3> <!></li> <li><h3 class="svelte-1tle3nc">See <a class="svelte-1tle3nc">props</a> &amp; <a class="svelte-1tle3nc">examples</a> for
				more information</h3></li></ol>`);

export default function Quick_start($$anchor) {
	// @example(quickStart, QuickStart.svelte)
	const x = 10;

	DocPage($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var ol = root();
			var li = $.child(ol);
			var node = $.sibling($.child(li), 2);

			Code(node, { source: 'npm i -D svelte-calendar' });
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_1 = $.sibling($.child(li_1), 2);

			Code(node_1, { pretranslated: quickStart.code });
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var h3 = $.child(li_2);
			var a = $.sibling($.child(h3));
			var a_1 = $.sibling(a, 2);

			$.next();
			$.reset(h3);
			$.reset(li_2);
			$.reset(ol);

			$.template_effect(() => {
				$.set_attribute(a, 'href', `${base ?? ''}/docs/props`);
				$.set_attribute(a_1, 'href', `${base ?? ''}/docs/examples`);
			});

			$.append($$anchor, ol);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('Quick-Start');

				$.append($$anchor, text);
			}
		}
	});
}