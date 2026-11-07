import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <pre class="status"> </pre>`, 1);

export default function _Variants($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.update(clicked),
		variant: 'raised',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Raised');

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
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Unelevated');

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
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Outlined');

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
		variant: 'raised',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Raised');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		color: 'secondary',
		onclick: () => $.update(clicked),
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Unelevated');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		color: 'secondary',
		onclick: () => $.update(clicked),
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Outlined');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_5, 2);
	var text_6 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_6, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}