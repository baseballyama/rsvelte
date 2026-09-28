import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Link($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.update(clicked),
		href: 'http://example.com',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Link');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}