import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button, P } from "flowbite-svelte";

var root = $.from_html(`<form id="example-form"><!> <!> <!></form>`);

export default function Example($$anchor) {
	let value = $.state("");

	const submitted = (e) => {
		e.preventDefault();
		alert(`You are searching: ${$.get(value)}`);
	};

	var form = root();
	var node = $.child(form);

	Search(node, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'my-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `You are searching: ${$.get(value) ?? ''}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Submit');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.event('submit', form, submitted);
	$.append($$anchor, form);
}