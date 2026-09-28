import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Tags } from "flowbite-svelte";

var root = $.from_html(`<pre class="dark:text-white"> </pre>`);
var root_1 = $.from_html(`<form><!> <!> <!></form>`);

export default function Default($$anchor) {
	let tags = $.state($.proxy([]));

	const handleClick = () => {
		alert(`Submitted: ${$.get(tags)}`);
	};

	var form = root_1();
	var node = $.child(form);

	Tags(node, {
		class: 'mt-5 mb-3',
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
			var pre = root();
			var text = $.only_child(pre, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($.get(tags), null, 2)]);
			$.append($$anchor, pre);
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