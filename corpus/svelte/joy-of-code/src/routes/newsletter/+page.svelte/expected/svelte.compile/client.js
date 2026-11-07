import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Heading from '$lib/ui/heading.svelte';
import Newsletter from '$lib/ui/newsletter.svelte';

var root = $.from_html(`<meta content="Subscribe for updates and tasty web development treats." name="description"/>`);
var root_1 = $.from_html(`<!> <div class="newsletter svelte-12eivhs"><!></div>`, 1);

export default function _page($$anchor) {
	var fragment = root_1();

	$.head('12eivhs', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Newsletter';
		});

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	Heading(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Newsletter');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Newsletter(node_1, {});
	$.reset(div);
	$.append($$anchor, fragment);
}