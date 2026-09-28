import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Tags } from "flowbite-svelte";

var root = $.from_html(`<form><!> <!></form>`);

export default function Disabled($$anchor) {
	let tags = $.state($.proxy(["foo", "bar"]));

	const handleClick = () => {
		alert(`Submitted: ${$.get(tags)}`);
	};

	var form = root();
	var node = $.child(form);

	Tags(node, {
		disabled: true,
		class: 'mt-5 mb-3',
		get value() {
			return $.get(tags);
		},

		set value($$value) {
			$.set(tags, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: handleClick,
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Submit');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}