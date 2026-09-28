import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Base from './base.svelte';

var root = $.from_html(`<div class="u-flex-vertical u-gap-8"><p>By default, all members are assigned a <span class="u-bold">Developer</span> role. You can
            change this at any time from your organization settings.</p> <p><a class="link" target="_blank" rel="noopener noreferrer" href="https://appwrite.io/docs/advanced/platform/roles">Learn more</a> about roles.</p></div>`);

export default function Default($$anchor) {
	Base($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}