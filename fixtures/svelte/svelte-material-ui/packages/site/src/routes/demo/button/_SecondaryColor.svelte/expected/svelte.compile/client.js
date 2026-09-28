import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<div class="svelte-1r2e477"><!> <!> <!> <!></div> <pre class="status svelte-1r2e477"> </pre>`, 1);

export default function _SecondaryColor($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		color: 'secondary',
		onclick: () => $.update(clicked),
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
		color: 'secondary',
		onclick: () => $.update(clicked),
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Disabled');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		color: 'secondary',
		onclick: () => $.update(clicked),
		ripple: false,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('No Ripple');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		color: 'secondary',
		onclick: () => $.update(clicked),
		class: 'myClass',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('With a Class');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_4 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_4, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}