import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SmuiElement } from '@smui/common';
import Button, { Label } from '@smui/button';
import { onMount } from 'svelte';

var root = $.from_html(`I'm rendered as a HTML <code>em</code> element!`, 1);
var root_1 = $.from_html(`<div><!> <!> <!> <!></div> <div><!></div>`, 1);

export default function _SmuiElement($$anchor, $$props) {
	$.push($$props, true);

	// When you change the tag, you can use the generic type argument to get the
	// right element from `getElement`. The first arg for Button is "href".
	let DivButton;

	let DivButtonElement;

	onMount(() => {
		DivButtonElement = DivButton.getElement();
		console.log(DivButtonElement);
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.bind_this(
		Button(node, {
			tag: 'div',
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('I\'m a <div /> Button');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}),
		($$value) => DivButton = $$value,
		() => DivButton
	);

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		tag: 'span',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('I\'m a <span /> Button');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		tag: 'strong',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('I\'m a <strong /> Button');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		tag: 'em',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('I\'m a <em /> Button');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	SmuiElement(node_4, {
		tag: 'em',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_5 = root();

			$.next(2);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}