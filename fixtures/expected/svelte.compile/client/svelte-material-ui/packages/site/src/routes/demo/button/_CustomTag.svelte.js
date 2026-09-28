import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<div><!> <ul class="svelte-ub75b1"><!> <!></ul></div> <pre class="status"> </pre>`, 1);

export default function _CustomTag($$anchor) {
	let clicked = $.state(0);

	function handleClick(event) {
		if (event.key === 'Enter') {
			$.update(clicked);
		}
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		tag: 'em',
		onclick: () => $.update(clicked),
		onkeypress: handleClick,
		tabindex: 0,
		role: 'button',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Em Tag');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var ul = $.sibling(node, 2);
	var node_1 = $.child(ul);

	Button(node_1, {
		tag: 'li',
		onclick: () => $.update(clicked),
		onkeypress: handleClick,
		tabindex: 0,
		role: 'button',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Li Tag');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		tag: 'li',
		onclick: () => $.update(clicked),
		onkeypress: handleClick,
		tabindex: 0,
		role: 'button',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Li Tag');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(ul);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_3, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}