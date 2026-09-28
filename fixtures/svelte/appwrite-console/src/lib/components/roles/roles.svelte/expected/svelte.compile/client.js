import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Base from './base.svelte';

var root = $.from_html(`<div class="u-flex-vertical u-gap-8"><p class="u-bold">Roles</p> <p> </p> <p><a class="link" target="_blank" rel="noopener noreferrer" href="https://appwrite.io/docs/advanced/platform/roles">Learn more</a> about roles.</p></div>`);

export default function Roles($$anchor, $$props) {
	const isProjectSpecific = $.prop($$props, 'isProjectSpecific', 3, false);

	Base($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var p = $.sibling($.child(div), 2);
			var text = $.only_child(p, true);

			$.next(2);
			$.reset(div);

			$.template_effect(() => $.set_text(text, isProjectSpecific()
				? 'Owner, Developer, Editor and Analyst.'
				: 'Owner, Developer, Editor, Analyst and Billing.'));

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}