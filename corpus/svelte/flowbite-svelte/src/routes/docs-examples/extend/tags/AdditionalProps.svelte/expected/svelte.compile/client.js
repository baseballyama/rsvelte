import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tags, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="rounded bg-gray-100 p-4"><strong>Selected Tags:</strong> <pre> </pre></div>`);
var root_1 = $.from_html(`<form class="mx-auto space-y-4"><!> <!> <!></form>`);

export default function AdditionalProps($$anchor) {
	let tags = $.state($.proxy([]));

	const available = [
		"svelte",
		"react",
		"vue",
		"angular",
		"javascript",
		"typescript",
		"flowbite",
		"flowbite-svelte",
		"tailwindcss"
	];

	const handleClick = () => {
		alert(`Submitted: ${$.get(tags).join(", ")}`);
	};

	var form = root_1();
	var node = $.child(form);

	Tags(node, {
		class: 'mt-5 mb-3',
		unique: true,
		get availableTags() {
			return available;
		},
		allowNewTags: false,
		showHelper: true,
		showAvailableTags: true,
		placeholder: 'Add tag',
		get value() {
			return $.get(tags);
		},

		set value($$value) {
			$.set(tags, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var pre = $.sibling($.child(div), 2);
			var text = $.only_child(pre, true);

			$.reset(div);
			$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($.get(tags), null, 2)]);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(tags).length > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: handleClick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Submit');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}