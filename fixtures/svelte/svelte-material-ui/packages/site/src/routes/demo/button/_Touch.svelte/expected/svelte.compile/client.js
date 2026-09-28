import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!> <!> <!> <pre class="status"> </pre>`, 1);

export default function _Touch($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.update(clicked),
		touch: true,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => $.update(clicked),
		touch: true,
		variant: 'raised',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Raised');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.update(clicked),
		touch: true,
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Unelevated');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => $.update(clicked),
		touch: true,
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Outlined');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_3, 2);
	var text_4 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_4, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}