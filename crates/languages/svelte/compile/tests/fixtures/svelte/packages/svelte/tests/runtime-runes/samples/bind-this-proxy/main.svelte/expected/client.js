import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let type = $.state($.proxy(Component));
	let elem = $.state(void 0);

	$.user_effect(() => {
		console.log($.get(elem));
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => $.get(type), ($$anchor, $$component) => {
		$.bind_this(
			$$component($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Content');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			}),
			($$value) => $.set(elem, $$value, true),
			() => $.get(elem)
		);
	});

	$.delegated('click', button, () => {
		if (!$.get(type)) {
			$.set(type, Component, true);
		} else {
			$.set(type, false);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);