import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Touch($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	IconButton(node, {
		onclick: () => $.update(clicked),
		touch: true,
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('build');

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